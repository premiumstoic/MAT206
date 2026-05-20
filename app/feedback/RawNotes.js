"use client";

import { useState, useEffect } from "react";

const rawNotes = `I believe that AI could lead these:
Easy understanding, everything can understood fastly.
But because you learn without the hesisation, the info can be forgetten easily.

Learning easily anywhere increases the tendency to procrastination. Because, you feel that you can easily, you may start to leave everything at late.

You can get easily side quested, because AI is eager to explain lots of topics if you are interested too, you can easily get outscoped, that leads to confusion and your learning efficiency about the course scope get decreased.

In term project, I felt that quite well. Because you are exploring a topic that is not mainly explained in the course, you are more to eager to find different things. That can quickly bloat the project and you start to struggle to finish the project.

Because AIs are quite optimistic, they can start to be delusional. You can get sidequested with "Industrial grade full process TCAD" while you are actually couldn't finish the educational level process TCAD.

I think AI effect of not writing the lots of things can disrupts the learning process. Because we are mostly learned with writing notes in middle and high school, decreasing the handwrite can actually disrupt background learning effect of kinetical movements.

I think recitation process could be the refined with the following:

There are lots of good questions, but some students can make the AI to finish all process without any human intervention. They may not be looking or solving that questions.
Each week's recitation could be 50% simulation 50% questions. Simulation can be stay same, but for the questions, students can write their own answers with their own hands to sheets. Even though, they can ask these questions to AI models, being required to handwrite them would lead to some kind of understanding and because there would be some kind of hard work, most of students would reserve at least 2 hours for the course without realizing.

For the term project, that would be 2 phase submission. Like week 10, the students can be required to submit questions about their projects like the recitation questions. If the professor admits the questions validity, they would again need to bring their own handwritten results about the term project.
(I am not proud of that suggestion, it would be unnecessary but still it is a suggestion)

But that could be a proposal report about the term project. Same kind of process like the week 10 -11, they would be required to submit a proposal report. That 2 phase submission can lead to more effective learning process for them`;

export default function RawNotes() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="raw-notes-callout">
        <p>
          The feedback above was organized by Claude from my original
          unstructured notes to make it easier to read. If you want to see the
          raw, unedited version &mdash; typos, shorthand, and all &mdash; you
          can view it below.
        </p>
        <button className="raw-notes-btn" onClick={() => setOpen(true)}>
          View My Original Notes
        </button>
      </div>

      {open && (
        <div className="raw-notes-overlay" onClick={() => setOpen(false)}>
          <div
            className="raw-notes-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="raw-notes-modal-header">
              <span>Original Notes</span>
              <button
                className="raw-notes-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="raw-notes-modal-body">
              {rawNotes.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
