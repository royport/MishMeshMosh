import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function formatDate(date: Date, includeTime: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };
  return date.toLocaleDateString('en-US', options);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: deed, error } = await supabase
      .from('deeds')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error || !deed) {
      return new NextResponse('Deed not found', { status: 404 });
    }

    const hasAccess = deed.created_by === user.id;

    if (!hasAccess) {
      return new NextResponse('Access denied', { status: 403 });
    }

    const doc = deed.doc_json;

    const itemsHtml = doc.items?.map((item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.title}</td>
        <td>${item.description || '-'}</td>
        <td>${item.unit}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">$${item.unitPrice?.toFixed(2)}</td>
        <td class="num">$${item.rowTotal?.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Need Deed (Conditional Purchase Agreement)</title>
  <style>
    :root{
      --ink:#111;
      --muted:#555;
      --hair:#d9d9d9;
      --paper:#fff;
      --shade:#f7f7f7;
    }

    html, body { background: var(--paper); color: var(--ink); }
    body{
      font-family: ui-serif, Georgia, "Times New Roman", Times, serif;
      line-height: 1.35;
      margin: 0;
      padding: 0;
    }

    .page{
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 18mm 16mm 18mm;
      box-sizing: border-box;
      position: relative;
    }

    .topbar{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap: 10mm;
      border-bottom: 1px solid var(--hair);
      padding-bottom: 6mm;
      margin-bottom: 7mm;
    }
    .title{
      margin:0;
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: .2px;
    }
    .subtitle{
      margin: 2mm 0 0;
      color: var(--muted);
      font-size: 10.5pt;
    }
    .meta{
      text-align:right;
      font-size: 9.5pt;
      color: var(--muted);
      white-space: nowrap;
    }
    .meta b{ color: var(--ink); font-weight: 600; }

    .muted{ color: var(--muted); }
    .small{ font-size: 9.5pt; }
    .tiny{ font-size: 8.5pt; }
    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    .pill{
      display:inline-block;
      border: 1px solid var(--hair);
      border-radius: 999px;
      padding: 1.5mm 3mm;
      font-size: 9.5pt;
      background: var(--shade);
    }

    .section{
      margin: 0 0 7mm;
      page-break-inside: avoid;
    }
    .section h2{
      font-size: 12pt;
      margin: 0 0 2.5mm;
      padding: 0 0 1.5mm;
      border-bottom: 1px solid var(--hair);
      letter-spacing: .2px;
    }
    .section h3{
      font-size: 10.5pt;
      margin: 3mm 0 1.5mm;
      color: var(--ink);
    }
    .section p{ margin: 0 0 2.2mm; }
    .bullets{ margin: 0; padding-left: 5mm; }
    .bullets li{ margin: 0 0 1.2mm; }

    table{
      width:100%;
      border-collapse: collapse;
      margin-top: 2mm;
      font-size: 9.8pt;
    }
    th, td{
      border: 1px solid var(--hair);
      padding: 2.2mm 2mm;
      vertical-align: top;
    }
    th{
      background: var(--shade);
      font-weight: 700;
      text-align: left;
    }
    td.num, th.num{ text-align:right; white-space:nowrap; }
    .table-note{
      margin-top: 2mm;
      color: var(--muted);
      font-size: 9.3pt;
    }

    .callout{
      border: 1px solid var(--hair);
      background: var(--shade);
      padding: 3mm 3mm;
      border-radius: 2mm;
      margin-top: 2mm;
    }

    .sig-grid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 8mm;
      margin-top: 4mm;
    }
    .sig{
      border: 1px solid var(--hair);
      border-radius: 2mm;
      padding: 4mm 4mm 3mm;
      min-height: 32mm;
      position: relative;
      background: #fff;
    }
    .sig .label{
      font-weight: 700;
      margin-bottom: 2mm;
    }
    .sig .line{
      margin-top: 12mm;
      border-top: 1px solid var(--hair);
      padding-top: 2mm;
      color: var(--muted);
      font-size: 9pt;
    }

    .footer{
      position: absolute;
      left: 16mm;
      right: 16mm;
      bottom: 12mm;
      padding-top: 3mm;
      border-top: 1px solid var(--hair);
      display:flex;
      justify-content: space-between;
      gap: 8mm;
      color: var(--muted);
      font-size: 8.8pt;
    }
    .footer .right{ text-align:right; }

    @page { size: A4; margin: 0; }
    @media print{
      .no-print{ display:none !important; }
      a{ color: inherit; text-decoration:none; }
    }
  </style>
</head>

<body>
  <div class="page">

    <div class="topbar">
      <div>
        <h1 class="title">Need Deed</h1>
        <div class="subtitle">Conditional Purchase Agreement </div>
        <div class="tiny muted" style="margin-top:2mm;">
          This agreement is conditionally enforceable and becomes binding only upon valid Assignment (Reed-Deed).
        </div>
      </div>
      <div class="meta">
        <div><b>Deed ID:</b> <span class="mono">${deed.id}</span></div>
        <div><b>Status:</b> <span class="pill">${deed.status}</span></div>
        <div><b>Version:</b> ${doc.deed?.version || 1}</div>
        <div><b>Campaign:</b> <span class="mono">${doc.campaign?.id}</span></div>
        <div><b>Signed at:</b> ${formatDate(new Date(deed.executed_at || deed.created_at))}</div>
        <div><b>Hash:</b> <span class="mono">${deed.doc_hash?.substring(0, 16)}...</span></div>
      </div>
    </div>

    <section class="section" id="parties">
      <h2>1. Parties</h2>
      <p>This Need Deed ("Agreement") is entered into between:</p>

      <table aria-label="Parties table">
        <tr>
          <th style="width:28%;">Backer (Buyer)</th>
          <td>
            <div><b>Name / Entity:</b> ${doc.backer?.full_name}</div>
            <div><b>Identifier:</b> <span class="mono">${doc.backer?.id}</span></div>
            <div><b>Email:</b> ${doc.backer?.email}</div>
            <div><b>Phone:</b> ${doc.backer?.phone}</div>
          </td>
        </tr>
        <tr>
          <th>Platform</th>
          <td>
            <div><b>Entity:</b> ${doc.platform?.legal_name}</div>
            <div><b>Company No.:</b> ${doc.platform?.company_number}</div>
            <div><b>Address:</b> ${doc.platform?.address}</div>
          </td>
        </tr>
      </table>
    </section>

    <section class="section" id="nature">
      <h2>2. Nature of This Agreement</h2>
      <p>
        This Agreement is a <b>fully specified purchase agreement</b> whose <b>execution is conditional</b>.
      </p>
      <ul class="bullets">
        <li>All commercial terms are <b>defined at signing</b>.</li>
        <li>No supplier is bound at this stage.</li>
        <li>The Backer's obligations become enforceable <b>only upon assignment</b> to a supplier via an Assignment (Reed) Deed.</li>
      </ul>

      <div class="callout small">
        <b>Clarification:</b>
        This Agreement is <b>not</b> a survey, <b>not</b> an option, and <b>not</b> a promise by the Platform to supply.
      </div>
    </section>

    <section class="section" id="subject">
      <h2>3. Subject Matter — Goods / Services to Be Supplied</h2>
      <p>
        The Backer agrees to purchase the following goods and/or services <b>if</b> this Agreement is assigned to a supplier
        under the campaign process.
      </p>

      <h3>3.1 Itemized Supply Table</h3>

      <table aria-label="Itemized supply table">
        <thead>
          <tr>
            <th style="width:6%;">Row</th>
            <th style="width:22%;">Item / Service</th>
            <th>Specifications</th>
            <th style="width:10%;">Unit</th>
            <th class="num" style="width:10%;">Quantity</th>
            <th class="num" style="width:12%;">Unit Price</th>
            <th class="num" style="width:12%;">Row Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p class="table-note">
        <b>Total Contract Value (Estimated):</b> <span class="mono">${doc.totals?.currency}</span> $${doc.totals?.total_value}
        <span class="muted">(subject only to quantity accuracy and explicitly allowed adjustments)</span>
      </p>

      <div class="tiny muted">
        This table forms an integral and binding part of this Agreement upon Assignment.
      </div>
    </section>

    <section class="section" id="delivery">
      <h2>4. Delivery & Performance Terms</h2>
      <p>If assigned, the Supplier shall:</p>
      <ul class="bullets">
        <li><b>Deliver to:</b> ${doc.delivery?.address}</li>
        <li><b>Delivery window:</b> ${doc.delivery?.window}</li>
        <li><b>Packaging / handling requirements:</b> ${doc.delivery?.packaging_requirements}</li>
        <li><b>Installation / services (if included):</b> ${doc.delivery?.services_included}</li>
      </ul>
    </section>

    <section class="section" id="payment">
      <h2>5. Commercial & Payment Terms (Defined Now, Executed Later)</h2>
      <p>The following commercial terms are agreed in advance:</p>

      <table aria-label="Payment terms table">
        <tr>
          <th style="width:28%;">Deposit / advance payment</th>
          <td>${doc.payment?.deposit_rule}</td>
        </tr>
        <tr>
          <th>Balance payment</th>
          <td>${doc.payment?.balance_rule}</td>
        </tr>
        <tr>
          <th>Payment method</th>
          <td>${doc.payment?.method}</td>
        </tr>
        <tr>
          <th>Currency</th>
          <td>${doc.totals?.currency}</td>
        </tr>
      </table>

      <div class="callout small">
        These terms <b>may not be unilaterally changed</b> upon Assignment.
      </div>
    </section>

    <section class="section" id="conditionality">
      <h2>6. Conditional Enforceability</h2>
      <p>This Agreement is <b>conditionally binding</b>, meaning:</p>
      <ul class="bullets">
        <li><b>No supplier</b> is obligated to supply until Assignment.</li>
        <li>The Backer cannot demand delivery until Assignment.</li>
        <li>All terms are frozen and pre-agreed.</li>
        <li>Upon Assignment, this becomes a <b>fully binding purchase contract</b> between Backer and Supplier.</li>
      </ul>
      <p class="muted small">If Assignment does not occur, this Agreement expires automatically under Section 10.</p>
    </section>

    <section class="section" id="signature">
      <h2>12. Digital Signature</h2>
      <p>By signing, the Backer confirms that they:</p>
      <ul class="bullets">
        <li>Intend to purchase under the terms defined herein.</li>
        <li>Understand the conditional nature of execution.</li>
        <li>Consent to assignment upon campaign success.</li>
      </ul>

      <div class="sig-grid">
        <div class="sig">
          <div class="label">Backer Signature</div>
          <div class="small">
            <div><b>Signer:</b> ${doc.backer?.full_name}</div>
            <div><b>Signer ID:</b> <span class="mono">${doc.backer?.id}</span></div>
            <div><b>Signature method:</b> ${doc.signature?.method}</div>
            <div><b>Signed at:</b> ${formatDate(new Date(deed.executed_at || deed.created_at), true)}</div>
          </div>
          <div class="line">Signature / verification record: <span class="mono">${doc.signature?.record_ref}</span></div>
        </div>

        <div class="sig">
          <div class="label">Platform Custody (Not a Supplier)</div>
          <div class="small">
            <div><b>Platform:</b> ${doc.platform?.legal_name}</div>
            <div><b>Custody timestamp:</b> ${formatDate(new Date(deed.executed_at || deed.created_at), true)}</div>
            <div><b>Document hash:</b> <span class="mono">${deed.doc_hash?.substring(0, 32)}</span></div>
          </div>
          <div class="line">Verification link: <span class="mono">${doc.deed?.verify_url}</span></div>
        </div>
      </div>
    </section>

    <div class="footer">
      <div class="left">
        <div><b>MishMeshMosh</b> — Need Deed</div>
        <div class="tiny">Generated from DB: deed <span class="mono">${deed.id}</span> • campaign <span class="mono">${doc.campaign?.id}</span></div>
      </div>
      <div class="right">
        <div class="tiny">Page 1 of 1</div>
        <div class="tiny mono">${deed.doc_hash?.substring(0, 16)}</div>
      </div>
    </div>

  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="need-deed-${deed.id}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating HTML deed:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
