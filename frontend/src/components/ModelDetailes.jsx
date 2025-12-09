import React from "react";

export default function ModelDetails({model}) {
    if (!model) return null;
  return (
    <div className="mt-8 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        About {model.name}
      </h3>
      <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-zinc-400">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            How it works
          </h4>
          <p>
            {model.howItWorks}
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Best for
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {model.bestFor?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}