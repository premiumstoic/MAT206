import ChatHistory from "./ChatHistory";
import RawNotes from "./RawNotes";

export const metadata = {
  title: "Feedback — MAT206",
  description:
    "Student feedback on the experimental AI-integrated teaching approach for Kinetics of Materials.",
};

export default function FeedbackPage() {
  return (
    <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>
      {/* Title Block */}
      <div className="journal-title-block">
        <span className="assignment-label">Course Feedback</span>
        <h1>Reflections on an Experiment</h1>
        <p className="tagline">
          A student&rsquo;s perspective on AI-integrated learning in Materials
          Science
        </p>
      </div>

      {/* Context */}
      <div className="context-callout">
        <h3>About This Page</h3>
        <p>
          Spring 2026 marked the first semester that MAT206 adopted an
          experimental teaching approach: instead of solving recitation problems
          in a classroom with TAs, students were assigned weekly online
          simulations built with LLMs, plus a term project option to create a
          realistic simulation instead of a traditional paper. This page
          documents my honest feedback on how well this new system worked, what
          surprised me, and what I think could be improved.
        </p>
      </div>

      <RawNotes />

      <div className="wavy-divider" />

      {/* Section 1: The New Format */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">01</span>
          <h2>The New Recitation Format</h2>
        </div>
        <div className="step-content">
          <p>
            Traditionally, recitation sessions meant gathering in a classroom
            where TAs walked through problem sets. This semester, everything
            moved online: every Thursday, the professor sent out an assignment
            asking us to build an HTML simulation about that week&rsquo;s topic
            using an LLM, plus answer conceptual questions from the email. We had
            one full week to complete it.
          </p>
          <p style={{ marginTop: "1rem" }}>
            The format had real strengths. With an AI assistant, you can
            understand concepts remarkably fast &mdash; things that might take
            an entire recitation session to click can become clear in minutes
            when you have an infinitely patient tutor. You can learn from
            anywhere, at any hour, and move at your own pace.
          </p>
          <p style={{ marginTop: "1rem" }}>
            But that ease is a double-edged sword. Because you <em>feel</em>{" "}
            like you can learn everything quickly, the temptation to
            procrastinate skyrockets. Why start on Thursday when you can
            &ldquo;easily&rdquo; do it on Wednesday night? That false sense of
            security can lead to a last-minute rush that undermines the very
            learning the format is designed to encourage.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 2: Working with AI */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">02</span>
          <h2>Working with AI to Learn</h2>
        </div>
        <div className="step-content">
          <p>
            The core idea was that students would use LLMs (like Gemini, ChatGPT,
            or Claude) to build interactive simulations &mdash; not just to get
            answers, but to understand the physics deeply enough to code a
            working model. This is a fundamentally different skill than solving
            equations on paper.
          </p>
          <p style={{ marginTop: "1rem" }}>
            AI makes understanding feel effortless. You ask a question, you get
            a clear explanation, you nod along, and it all makes sense in the
            moment. But here is the catch: because you learn without the
            hesitation, without the struggle of working through a problem on
            your own, the information can be forgotten just as easily as it was
            absorbed. There is something about wrestling with a concept &mdash;
            staring at a blank page, trying different approaches, getting stuck
            &mdash; that cements knowledge in a way that a smooth AI
            conversation simply does not.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Another unexpected issue: <strong>getting side-quested</strong>. AI
            models are eager to explain. If you show even a spark of curiosity
            about a tangent, the AI will happily dive deep into it. That is
            wonderful for general learning, but dangerous for a course with a
            defined scope. I found myself going down rabbit holes that, while
            fascinating, pulled my attention away from what I actually needed to
            learn for the class. Your learning efficiency about the course
            material decreases when you are scattered across ten interesting but
            off-topic directions.
          </p>
          <p style={{ marginTop: "1rem" }}>
            I also think the shift away from writing things down by hand has a
            hidden cost. Most of us learned throughout middle and high school by
            taking handwritten notes. There is a background learning effect in
            the kinetic act of writing &mdash; forming letters, organizing
            thoughts on paper, summarizing in your own words. When AI handles
            all of that, you lose a channel of learning you may not even realize
            you depend on.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 3: The Simulation Assignments */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">03</span>
          <h2>Building Simulations</h2>
        </div>
        <div className="step-content">
          <p>
            Each week brought a new challenge: Monte Carlo methods, Grand
            Canonical ensembles, phase transformations, Wulff constructions,
            grain growth, Ostwald ripening, nucleation... Translating these
            concepts into working HTML simulations required a deep engagement
            with the material.
          </p>
          <p style={{ marginTop: "1rem" }}>
            The simulation assignments were genuinely rewarding when they
            worked. Seeing a Monte Carlo simulation actually produce phase
            separation, or watching grains coarsen in real time, gave an
            intuitive understanding that no textbook diagram could match. The
            process of debugging a simulation also forces you to confront what
            you do and do not actually understand about the physics.
          </p>
          <p style={{ marginTop: "1rem" }}>
            However, there is a significant gap in the current format: some
            students can have the AI generate the entire simulation without
            meaningful human intervention. You copy the professor&rsquo;s email
            into the chat, the AI produces working code, and you submit it. The
            conceptual questions included in the assignment are good, but if a
            student is not engaged, those questions can also be answered by the
            AI with no real thought from the student.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 4: Term Project */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">04</span>
          <h2>The Term Project</h2>
        </div>
        <div className="step-content">
          <p>
            Instead of a traditional final exam, the course offered two paths for
            the term project: write a detailed paper analyzing an engineering
            application from a materials kinetics perspective, or &mdash; for
            those who wanted to use AI &mdash; build a realistic simulation of a
            topic and be graded on the code&rsquo;s physical realism. The paper
            path explicitly penalized AI-generated text, while the simulation
            path embraced it but raised the bar significantly.
          </p>
          <p style={{ marginTop: "1rem" }}>
            I chose the simulation path, and this is where the side-questing
            problem hit hardest. When you are exploring a topic that was not
            deeply covered in lectures, you naturally become eager to discover
            new things. With an AI ready to explain anything, the scope of what
            feels &ldquo;possible&rdquo; expands rapidly. The project can bloat
            before you realize it, and suddenly you are struggling to finish
            something that started as a focused idea.
          </p>
          <p style={{ marginTop: "1rem" }}>
            AIs are also inherently optimistic. They will enthusiastically
            suggest building an &ldquo;industrial-grade full-process TCAD
            simulator&rdquo; when you have not even finished getting a basic
            educational-level simulation working. That optimism can be
            infectious &mdash; you start believing you can build something far
            more ambitious than is realistic, and by the time reality sets in,
            you have wasted time on features that were never going to work at
            the level you needed.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 5: What Worked & What Didn't */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">05</span>
          <h2>Suggestions for Future Semesters</h2>
        </div>
        <div className="step-content">
          <p>
            I think the recitation process could be refined with a simple
            structural change:{" "}
            <strong>make each week 50% simulation, 50% handwritten
            questions</strong>. The simulation part can stay exactly as it is
            &mdash; it works well. But for the conceptual questions, students
            should be required to write their answers by hand on paper and
            submit them physically.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Even if students ask AI models the same questions beforehand, the
            act of handwriting the answers forces a level of engagement that
            copy-pasting does not. And because there would be a tangible amount
            of work involved, most students would end up reserving at least a
            couple of hours for the course each week without even realizing it.
            That consistent time investment is exactly what builds real
            understanding.
          </p>
          <p style={{ marginTop: "1rem" }}>
            For the term project, I would suggest a{" "}
            <strong>two-phase submission process</strong>. Similar to how
            Weeks 10&ndash;11 worked with the recitation questions, students
            could first be required to submit a proposal report about their
            project &mdash; what they plan to simulate, which equations and
            physical principles are involved, and what the expected outcomes
            look like. If the professor approves the proposal, students proceed
            with the full simulation. This two-phase approach would catch scope
            creep early and force students to think through their project before
            getting lost in implementation.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 6: Overall Verdict */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">06</span>
          <h2>Overall Verdict</h2>
        </div>
        <div className="step-content">
          <p>
            AI-integrated learning is powerful but deceptive. It makes
            understanding feel instant, but retention requires struggle. It
            makes ambition feel boundless, but scope must be managed. It removes
            friction from learning, but some of that friction &mdash; the slow
            writing, the confusion, the wrong turns &mdash; is actually where
            deep learning happens.
          </p>
          <p style={{ marginTop: "1rem" }}>
            The experiment was worth running. Building simulations gave me
            intuitions about materials kinetics that I would never have gotten
            from problem sets alone. But the format needs guardrails &mdash;
            structured handwriting components, phased submissions, and honest
            conversations about what AI makes easier versus what it makes you
            skip.
          </p>
        </div>
      </section>

      <div className="wavy-divider" />

      {/* Section 7: Gemini Chat History */}
      <section className="step-block">
        <div className="step-header">
          <span className="step-number">07</span>
          <h2>Behind the Scenes: My Gemini Chat</h2>
        </div>
        <div className="step-content">
          <p>
            Below is a real conversation I had with Google Gemini while working
            on the recitation assignments. It shows the back-and-forth process of
            learning the physics with AI before building simulations — the
            questions, the reasoning, and the moments of understanding.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <ChatHistory />
          </div>
        </div>
      </section>
    </div>
  );
}
