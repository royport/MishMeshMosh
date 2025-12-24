'use client';

function formatDate(date: Date, formatStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const d = new Date(date);
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  if (formatStr === 'MMM d, yyyy HH:mm') {
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  }
  if (formatStr === 'MMM d, yyyy HH:mm:ss') {
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  }
  return d.toISOString();
}

export default function NeedDeedViewer({
  deed,
  auditTrail = [],
  versionHistory = []
}: {
  deed: any;
  auditTrail?: any[];
  versionHistory?: any[]
}) {
  const doc = deed.doc_json;
  const isImmutable = ['signed', 'executed', 'active', 'fulfilled'].includes(deed.status);

  if (!doc) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <p className="text-slate-600">Deed document data is missing</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 print-deed">
      {isImmutable && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2 no-print">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-medium text-amber-800">
            This deed is immutable and cannot be edited. Status: {deed.status}
          </span>
        </div>
      )}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Need Deed</h2>
            <p className="text-slate-600">Conditional Purchase Agreement</p>
            <p className="text-xs text-slate-500 mt-2">
              This agreement is conditionally enforceable and becomes binding only upon valid Assignment (Reed-Deed).
            </p>
          </div>

          <div className="text-right text-sm space-y-1">
            <div><span className="font-medium">Deed ID:</span> <span className="font-mono text-xs">{deed.id}</span></div>
            <div><span className="font-medium">Status:</span> <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{deed.status}</span></div>
            <div>
              <span className="font-medium">Version:</span> {deed.version || 1}
              {versionHistory.length > 1 && (
                <span className="ml-1 text-xs text-slate-500">
                  (of {versionHistory.length})
                </span>
              )}
            </div>
            <div><span className="font-medium">Signed:</span> {new Date(deed.executed_at || deed.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            <div><span className="font-medium">Hash:</span> <span className="font-mono text-xs">{deed.doc_hash?.substring(0, 16)}...</span></div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            1. Parties
          </h3>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-slate-900 mb-2">Backer (Buyer)</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {doc.backer?.full_name}</div>
                <div><span className="font-medium">ID:</span> <span className="font-mono text-xs">{doc.backer?.id}</span></div>
                <div><span className="font-medium">Email:</span> {doc.backer?.email}</div>
                <div><span className="font-medium">Phone:</span> {doc.backer?.phone}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-slate-900 mb-2">Platform</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Entity:</span> {doc.platform?.legal_name}</div>
                <div><span className="font-medium">Company No.:</span> {doc.platform?.company_number}</div>
                <div><span className="font-medium">Address:</span> {doc.platform?.address}</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            2. Nature of This Agreement
          </h3>
          <p className="text-slate-700 mb-3">
            This Agreement is a <strong>fully specified purchase agreement</strong> whose <strong>execution is conditional</strong>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>All commercial terms are defined at signing.</li>
            <li>No supplier is bound at this stage.</li>
            <li>The Backer&apos;s obligations become enforceable only upon assignment to a supplier via an Assignment (Reed) Deed.</li>
          </ul>
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
            <strong>Clarification:</strong> This Agreement is not a survey, not an option, and not a promise by the Platform to supply.
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            3. Subject Matter — Goods / Services to Be Supplied
          </h3>
          <p className="text-slate-700 mb-4">
            The Backer agrees to purchase the following goods and/or services if this Agreement is assigned to a supplier under the campaign process.
          </p>

          <h4 className="font-semibold text-slate-900 mb-3">3.1 Itemized Supply Table</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Item / Service</th>
                  <th className="text-left p-3 font-semibold">Specifications</th>
                  <th className="text-left p-3 font-semibold">Unit</th>
                  <th className="text-right p-3 font-semibold">Quantity</th>
                  <th className="text-right p-3 font-semibold">Unit Price</th>
                  <th className="text-right p-3 font-semibold">Row Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-t border-slate-200">
                    <td className="p-3">{item.title}</td>
                    <td className="p-3 text-slate-600">{item.description || '-'}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">${item.unitPrice?.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">${item.rowTotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-sm">
            <strong>Total Contract Value (Estimated):</strong>{' '}
            <span className="font-mono">{doc.totals?.currency}</span> ${doc.totals?.total_value}
            <span className="text-slate-500 ml-2">(subject only to quantity accuracy and explicitly allowed adjustments)</span>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            4. Delivery & Performance Terms
          </h3>
          <p className="text-slate-700 mb-2">If assigned, the Supplier shall:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li><strong>Deliver to:</strong> {doc.delivery?.address}</li>
            <li><strong>Delivery window:</strong> {doc.delivery?.window}</li>
            <li><strong>Packaging / handling requirements:</strong> {doc.delivery?.packaging_requirements}</li>
            <li><strong>Installation / services (if included):</strong> {doc.delivery?.services_included}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            5. Commercial & Payment Terms
          </h3>
          <p className="text-slate-700 mb-4">The following commercial terms are agreed in advance:</p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 p-3 text-left font-semibold w-1/3">Deposit / advance payment</th>
                  <td className="p-3">{doc.payment?.deposit_rule}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 p-3 text-left font-semibold">Balance payment</th>
                  <td className="p-3">{doc.payment?.balance_rule}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 p-3 text-left font-semibold">Payment method</th>
                  <td className="p-3">{doc.payment?.method}</td>
                </tr>
                <tr>
                  <th className="bg-slate-50 p-3 text-left font-semibold">Currency</th>
                  <td className="p-3">{doc.totals?.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
            These terms <strong>may not be unilaterally changed</strong> upon Assignment.
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            6. Conditional Enforceability
          </h3>
          <p className="text-slate-700 mb-3">This Agreement is <strong>conditionally binding</strong>, meaning:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>No supplier is obligated to supply until Assignment.</li>
            <li>The Backer cannot demand delivery until Assignment.</li>
            <li>All terms are frozen and pre-agreed.</li>
            <li>Upon Assignment, this becomes a fully binding purchase contract between Backer and Supplier.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            12. Digital Signature
          </h3>
          <p className="text-slate-700 mb-4">By signing, the Backer confirms that they:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
            <li>Intend to purchase under the terms defined herein.</li>
            <li>Understand the conditional nature of execution.</li>
            <li>Consent to assignment upon campaign success.</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="font-semibold text-slate-900 mb-3">Backer Signature</div>
              <div className="space-y-1 text-sm">
                <div><strong>Signer:</strong> {doc.backer?.full_name}</div>
                <div><strong>Signer ID:</strong> <span className="font-mono text-xs">{doc.backer?.id}</span></div>
                <div><strong>Method:</strong> {doc.signature?.method}</div>
                <div><strong>Signed at:</strong> {new Date(deed.executed_at || deed.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-300 text-xs text-slate-600">
                Record: <span className="font-mono">{doc.signature?.record_ref}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="font-semibold text-slate-900 mb-3">Platform Custody</div>
              <div className="space-y-1 text-sm">
                <div><strong>Platform:</strong> {doc.platform?.legal_name}</div>
                <div><strong>Timestamp:</strong> {new Date(deed.executed_at || deed.created_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>Hash:</strong> <span className="font-mono text-xs">{deed.doc_hash?.substring(0, 32)}...</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-300 text-xs text-slate-600">
                Verify: <span className="font-mono">{doc.deed?.verify_url}</span>
              </div>
            </div>
          </div>
        </section>

        {versionHistory.length > 1 && (
          <section className="border-t border-slate-200 pt-8 no-print">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Version History
            </h3>
            <div className="space-y-2">
              {versionHistory.map((version: any) => (
                <div key={version.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      v{version.version}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      version.id === deed.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {version.id === deed.id ? 'Current' : version.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">
                      {formatDate(new Date(version.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                    {version.id !== deed.id && (
                      <a
                        href={`/workspace/deeds/${version.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {auditTrail.length > 0 && (
          <section className="border-t border-slate-200 pt-8 no-print">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Audit Trail
            </h3>
            <div className="space-y-2">
              {auditTrail.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {entry.action}
                    </span>
                    <span className="text-slate-600">
                      {entry.actor?.full_name || 'System'}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">
                    {formatDate(new Date(entry.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          <div className="font-semibold">MishMeshMosh — Need Deed</div>
          <div className="font-mono">Deed: {deed.id} • Campaign: {doc.campaign?.id}</div>
        </div>
        <div className="text-right">
          <div>Page 1 of 1</div>
          <div className="font-mono">{deed.doc_hash?.substring(0, 16)}</div>
        </div>
      </div>
    </div>
  );
}
