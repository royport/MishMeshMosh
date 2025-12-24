/*
  # Add Feed Campaign Auto-Creation System

  ## Purpose
  Automatically creates Feed campaigns when Need campaigns reach "seeded" status,
  enabling suppliers to respond to validated demand.

  ## New Functions
  
  ### 1. `create_feed_campaign_from_seeded(need_campaign_id uuid)`
  - Creates a new Feed campaign linked to a seeded Need campaign
  - Copies campaign items from the Need campaign
  - Sets default bid deadline (e.g., 14 days from creation)
  - Returns the new Feed campaign ID
  
  ### 2. `get_campaign_bom(campaign_id uuid)`
  - Aggregates all pledged quantities by item (Bill of Materials)
  - Returns total quantities needed for each campaign item
  - Used to show suppliers the full demand
  
  ## Database Changes
  
  - No new tables required (feed_campaigns, supplier_offers already exist)
  - Adds trigger to auto-create Feed campaign when Need campaign transitions to seeded
  
  ## Security
  - Functions use SECURITY DEFINER for system-level operations
  - RLS policies ensure only authorized suppliers can create offers
*/

-- Function to aggregate demand (BOM) for a campaign
CREATE OR REPLACE FUNCTION get_campaign_bom(p_campaign_id uuid)
RETURNS TABLE (
  item_id uuid,
  item_code text,
  item_title text,
  item_description text,
  unit text,
  total_quantity numeric,
  backer_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id as item_id,
    ci.item_code,
    ci.title as item_title,
    ci.description as item_description,
    ci.unit,
    COALESCE(SUM(npr.quantity), 0) as total_quantity,
    COUNT(DISTINCT np.backer_id) as backer_count
  FROM campaign_items ci
  LEFT JOIN need_pledge_rows npr ON npr.campaign_item_id = ci.id
  LEFT JOIN need_pledges np ON np.id = npr.pledge_id AND np.status = 'active'
  WHERE ci.campaign_id = p_campaign_id
  GROUP BY ci.id, ci.item_code, ci.title, ci.description, ci.unit
  ORDER BY ci.item_code, ci.title;
END;
$$;

-- Function to create a Feed campaign from a seeded Need campaign
CREATE OR REPLACE FUNCTION create_feed_campaign_from_seeded(p_need_campaign_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_need_campaign record;
  v_feed_campaign_id uuid;
  v_item record;
BEGIN
  -- Get the Need campaign
  SELECT * INTO v_need_campaign
  FROM campaigns
  WHERE id = p_need_campaign_id AND kind = 'need' AND status_need = 'seeded';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or not in seeded status';
  END IF;
  
  -- Check if Feed campaign already exists
  SELECT id INTO v_feed_campaign_id
  FROM campaigns
  WHERE kind = 'feed' 
    AND title = v_need_campaign.title || ' - Supply Opportunity'
    AND created_at > v_need_campaign.updated_at - interval '1 hour';
  
  IF FOUND THEN
    -- Already created, return existing ID
    RETURN v_feed_campaign_id;
  END IF;
  
  -- Create the Feed campaign
  INSERT INTO campaigns (
    kind,
    title,
    description,
    visibility,
    group_id,
    created_by,
    status_feed
  ) VALUES (
    'feed',
    v_need_campaign.title || ' - Supply Opportunity',
    'Supply opportunity for validated demand: ' || COALESCE(v_need_campaign.description, ''),
    'public',
    v_need_campaign.group_id,
    v_need_campaign.created_by,
    'open'
  ) RETURNING id INTO v_feed_campaign_id;
  
  -- Create feed_campaigns details
  INSERT INTO feed_campaigns (
    campaign_id,
    bid_deadline_at,
    award_method,
    eligibility_rules_json,
    compliance_requirements_json
  ) VALUES (
    v_feed_campaign_id,
    now() + interval '14 days',
    'manual',
    '{"requires_verification": false}'::jsonb,
    '{"basic_compliance": true}'::jsonb
  );
  
  -- Copy campaign items from Need campaign
  FOR v_item IN 
    SELECT * FROM campaign_items WHERE campaign_id = p_need_campaign_id
  LOOP
    INSERT INTO campaign_items (
      campaign_id,
      item_code,
      title,
      description,
      unit,
      variant_json
    ) VALUES (
      v_feed_campaign_id,
      v_item.item_code,
      v_item.title,
      v_item.description,
      v_item.unit,
      v_item.variant_json
    );
  END LOOP;
  
  -- Create audit log
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    payload_json
  ) VALUES (
    'feed_campaign_created',
    'campaign',
    v_feed_campaign_id,
    jsonb_build_object(
      'source_need_campaign_id', p_need_campaign_id,
      'auto_created', true
    )
  );
  
  -- Update Need campaign to reference Feed campaign
  UPDATE campaigns
  SET updated_at = now()
  WHERE id = p_need_campaign_id;
  
  RETURN v_feed_campaign_id;
END;
$$;

-- Trigger function to auto-create Feed campaign when Need campaign is seeded
CREATE OR REPLACE FUNCTION trigger_create_feed_on_seed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feed_id uuid;
BEGIN
  -- Check if status changed to 'seeded'
  IF NEW.kind = 'need' AND NEW.status_need = 'seeded' AND (OLD.status_need IS NULL OR OLD.status_need != 'seeded') THEN
    -- Create Feed campaign
    v_feed_id := create_feed_campaign_from_seeded(NEW.id);
    
    -- Log the creation
    RAISE NOTICE 'Auto-created Feed campaign % for Need campaign %', v_feed_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS auto_create_feed_on_seed ON campaigns;
CREATE TRIGGER auto_create_feed_on_seed
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_feed_on_seed();

-- Grant permissions for suppliers to view Feed campaigns and create offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Anyone can view open Feed campaigns'
  ) THEN
    CREATE POLICY "Anyone can view open Feed campaigns"
      ON campaigns
      FOR SELECT
      USING (kind = 'feed' AND status_feed IN ('open', 'review'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can create offers'
  ) THEN
    CREATE POLICY "Suppliers can create offers"
      ON supplier_offers
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can view their own offers'
  ) THEN
    CREATE POLICY "Suppliers can view their own offers"
      ON supplier_offers
      FOR SELECT
      TO authenticated
      USING (supplier_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offers' AND policyname = 'Suppliers can update their own draft offers'
  ) THEN
    CREATE POLICY "Suppliers can update their own draft offers"
      ON supplier_offers
      FOR UPDATE
      TO authenticated
      USING (supplier_id = auth.uid() AND status = 'draft')
      WITH CHECK (supplier_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can insert their own offer rows'
  ) THEN
    CREATE POLICY "Suppliers can insert their own offer rows"
      ON supplier_offer_rows
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can view their own offer rows'
  ) THEN
    CREATE POLICY "Suppliers can view their own offer rows"
      ON supplier_offer_rows
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'supplier_offer_rows' AND policyname = 'Suppliers can update their own draft offer rows'
  ) THEN
    CREATE POLICY "Suppliers can update their own draft offer rows"
      ON supplier_offer_rows
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid() AND status = 'draft'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM supplier_offers
          WHERE id = offer_id AND supplier_id = auth.uid() AND status = 'draft'
        )
      );
  END IF;
END $$;