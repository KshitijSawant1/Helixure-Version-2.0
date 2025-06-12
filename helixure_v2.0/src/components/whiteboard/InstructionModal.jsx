import React, { useState } from "react";
import "./InstructionModal.css";
import PoWShowcase from "./PoWShowcase";
const InstructionModal = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Private Blockchain Whiteboard",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              This is your private blockchain canvas – where every interaction
              is logged and visualized as blocks.
            </li>
            <li>
              Each block represents a unique event, secured and chained together
              immutably.
            </li>
            <li>
              Drag blocks, link them, and build your digital story – block by
              block.
            </li>
            <li>
              This is more than just a whiteboard. It’s your decentralized
              journal of thoughts, actions, and ideas.
            </li>
          </ul>

          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              {[0, 1, 2, 3].map((_, index) => (
                <React.Fragment key={index}>
                  <div
                    className="w-10 h-10 rounded-md shadow-lg bg-gradient-to-br from-blue-400 to-cyan-300 wave-bounce"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                    }}
                  ></div>
                  {index < 3 && (
                    <div className="h-1 w-6 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 animate-wave-link" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Understanding the Space",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              Each environment is called a <strong>Space or Environment</strong>
              .
            </li>
            <li>
              You can create multiple spaces based on your ideas or topics.
            </li>
            <li>Within each space, you can drag-and-drop blocks freely.</li>
            <li>
              You can personalize a space with names, descriptions to represent
              different contexts or workflows.
            </li>
            <li>
              Every interaction inside a space is recorded as a block in
              sequence, helping you trace the flow of thought or action.
            </li>
          </ul>

          <div className="flex justify-center mt-6">
            <div className="w-64 h-36 rounded-lg shadow-lg bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center text-white text-sm font-medium  relative overflow-hidden">
              <span className="z-10">Illustration of a Space Layout</span>
              <div className="absolute inset-0 bg-white/10 [background-size:20px_20px] [background-image:linear-gradient(to_right,_white_1px,_transparent_1px),_linear-gradient(to_bottom,_white_1px,_transparent_1px)] pointer-events-none" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Proof of Work (PoW)",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              Before adding a block, you must solve a mini challenge – like a
              puzzle, CAPTCHA, or logic task.
            </li>
            <li>
              This simulates the <b>Proof of Work</b> mechanism used in
              blockchain systems.
            </li>
            <li>
              It ensures that each block is added with <b>intention</b>, adding
              a layer of security and effort.
            </li>
            <li>
              These challenges are lightweight but necessary – they prevent
              accidental or spammy block creation.
            </li>
          </ul>

          <div className="flex justify-center mt-6">
            {step === 2 && <PoWShowcase />}
          </div>
        </div>
      ),
    },
    {
      title: "Proof of History (PoH)",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              In this system, each block is automatically stamped with a unique
              color signature based on the <strong>day</strong> and{" "}
              <strong>time</strong> it was created.
            </li>
            <li>
              The <strong>“Color of the Day”</strong> gives all blocks on the
              same day a unified theme, while the <strong>“Hue of Time”</strong>{" "}
              creates gradual shading based on the hour.
            </li>
            <li>
              This allows you to visually interpret when a block was added —
              without checking timestamps — by simply observing its shade.
            </li>
            <li>
              It’s a subtle but powerful way to bring{" "}
              <strong>temporal awareness</strong> into your blockchain journal.
            </li>
            <li>
              For example, if today’s color is <strong>blue</strong>, earlier
              blocks may appear as <code>blue-100</code>, while later ones
              deepen to <code>blue-900</code>.
            </li>
            <li>
              This creates a <strong>visual trail of time</strong>, helping you
              distinguish when blocks were created — at a glance.
            </li>
          </ul>

          {/* Color Ramp Preview */}
          <div className="flex justify-center mt-6 space-x-2">
            {[
              "bg-blue-100",
              "bg-blue-200",
              "bg-blue-300",
              "bg-blue-400",
              "bg-blue-500",
              "bg-blue-600",
              "bg-blue-700",
              "bg-blue-800",
              "bg-blue-900",
            ].map((cls, index) => (
              <div
                key={cls}
                className={`w-8 h-8 rounded shadow border border-white ${cls}`}
                title={`blue-${(index + 1) * 100}`}
              />
            ))}
          </div>
          <ol className="flex items-center w-full justify-center text-sm font-medium text-gray-600 dark:text-gray-300 sm:text-base mt-4">
            <li className="flex items-center after:w-8 after:h-1 after:bg-gray-300 dark:after:bg-gray-600 after:inline-block after:mx-2">
              <span className="flex items-center">Morning</span>
            </li>
            <li className="flex items-center after:w-8 after:h-1 after:bg-gray-300 dark:after:bg-gray-600 after:inline-block after:mx-2">
              <span className="flex items-center">Afternoon</span>
            </li>
            <li className="flex items-center after:w-8 after:h-1 after:bg-gray-300 dark:after:bg-gray-600 after:inline-block after:mx-2">
              <span className="flex items-center">Evening</span>
            </li>
            <li className="flex items-center">
              <span className="flex items-center">Night</span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "Gas Meter Explained",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              Every action — like creating a block, linking, or deleting —
              consumes a small amount of <strong>gas</strong>.
            </li>
            <li>
              The <strong>Gas Counter</strong> shows the cumulative gas used in
              your current space.
            </li>
            <li>
              This concept is inspired by blockchain systems where operations
              require computational effort.
            </li>
            <li>
              The counter helps visualize how{" "}
              <strong>intensive or lightweight</strong> your activity has been.
            </li>
            <li>
              It encourages thoughtful block creation, avoiding spammy or
              redundant actions.
            </li>
            <li>
              Think of it as a reflection of the <strong>energy</strong> you’ve
              spent to build your decentralized record.
            </li>
            <li>
              Example: You've spent <strong>0.000028 gas</strong> so far —
              minimal but meaningful.
            </li>
          </ul>

          {/* Counter UI */}
          <div className="flex justify-center mt-6">
            <div className="bg-gray-800 text-green-400 font-mono px-6 py-3 text-xl rounded-lg shadow-md border border-green-400">
              Gas Used: <span className="font-bold">0.000028</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Creating & Connecting Blocks",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-black dark:text-white text-sm">
            <li>
              You can <strong>drag blocks</strong> anywhere within the space —
              arrange them however it fits your workflow.
            </li>
            <li>
              To <strong>link blocks</strong>, click on one block to start a
              connection and then click on another to complete the link.
            </li>
            <li>
              Connections are visualized as arrows, allowing you to represent{" "}
              <strong>flows</strong>, <strong>dependencies</strong>, or{" "}
              <strong>ideas</strong>.
            </li>
            <li>
              You can create simple <strong>linear sequences</strong> or more
              complex <strong>networks</strong> of blocks.
            </li>
            <li>
              It’s a powerful way to visualize your thoughts, tasks, or
              structured processes.
            </li>
          </ul>

          <div className="flex items-center justify-center space-x-4 mt-6">
            {/* Block A */}
            <div className="w-24 h-16 bg-blue-500 text-white flex items-center justify-center rounded shadow">
              Block A
            </div>

            {/* Arrow */}
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-4-4l4 4-4 4"
              />
            </svg>

            {/* Block B */}
            <div className="w-24 h-16 bg-green-500 text-white flex items-center justify-center rounded shadow">
              Block B
            </div>

            {/* Arrow */}
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-4-4l4 4-4 4"
              />
            </svg>

            {/* Block C */}
            <div className="w-24 h-16 bg-purple-500 text-white flex items-center justify-center rounded shadow">
              Block C
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Save, Export, and Revisit",
      content: (
        <div className="space-y-4 text-left">
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-200 text-sm">
            <li>
              All your work is <strong>auto-saved in your browser</strong>. No
              need to worry about losing your progress.
            </li>
            <li>
              You can <strong>export the canvas</strong> as an image to share or
              store your ideas externally.
            </li>
            <li>
              Revisit any previously created space and continue from where you
              left off.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Disclaimer",
      content: (
        <div className="space-y-4 text-left text-sm text-gray-700 dark:text-gray-200">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-yellow-500 dark:text-yellow-400 text-3xl">
              <svg
                class="w-[37px] h-[37px] text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5.005 11.19V12l6.998 4.042L19 12v-.81M5 16.15v.81L11.997 21l6.998-4.042v-.81M12.003 3 5.005 7.042l6.998 4.042L19 7.042 12.003 3Z"
                />
              </svg>
            </div>
          </div>

          <p>
            This whiteboard is a{" "}
            <strong>conceptual and educational simulation</strong> of
            blockchain-based interaction and visualization. It demonstrates how
            entries can be chained and tracked but is not an actual
            decentralized blockchain.
          </p>
          <p>
            <strong>Your data is stored securely on Supabase</strong>, a trusted
            cloud backend. However, this data is still managed in a centralized
            environment and may be visible to platform administrators.
          </p>
          <p>
            Please use this platform strictly for{" "}
            <strong>personal learning, journaling, or ideation</strong>. Avoid
            entering sensitive, personal, or confidential information.
          </p>
          <p className="text-xs italic text-gray-500 dark:text-gray-400">
            By continuing, you acknowledge the centralized nature of storage,
            understand the purpose of this simulation, and accept responsibility
            for the content you submit.
          </p>
        </div>
      ),
    },
    {
      title: "You're Ready!",
      content: (
        <div className="space-y-4 text-left text-sm text-gray-700 dark:text-gray-200">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You have now explored the key components of this
              blockchain-powered whiteboard.
            </li>
            <li>
              Each action you perform—from block creation to connection—is
              logged transparently and immutably.
            </li>
            <li>
              Visual features like Proof of Work, Proof of History, and the Gas
              Counter provide both security and clarity to your work.
            </li>
            <li>
              Your progress and structures are saved securely using Supabase,
              enabling retrieval and continuity across sessions.
            </li>
            <li>
              You can revisit this instructional guide anytime by clicking the
              Help icon at the botton navigation tab
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </li>
          </ul>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
            You are all set to begin building your chain of ideas.
          </p>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onClose();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg md:w-[700px] p-4 md:p-6 shadow-lg flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start ">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {steps[step].title}
          </h2>
          <button
            onClick={onClose}
            disabled={step !== steps.length - 1}
            className={`text-lg ${
              step === steps.length - 1
                ? "text-red-400 hover:text-red-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title={
              step === steps.length - 1
                ? "Close"
                : "Complete all steps to close"
            }
          >
            ✕
          </button>
        </div>

        <hr className="h-px bg-gray-300 border-0 dark:bg-gray-600 mb-2" />

        {/* Body */}
        <div className="text-sm text-gray-700 dark:text-gray-200 mb-6 overflow-y-auto">
          {typeof steps[step].content === "string" ? (
            <p>{steps[step].content}</p>
          ) : (
            steps[step].content
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`px-4 py-2 rounded text-sm ${
              step === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {step === 0 && (
              <button
                onClick={() => setStep(steps.length - 1)}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200"
              >
                Skip to End
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {step === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
