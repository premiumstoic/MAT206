Context

You are an expert scientific programmer. I need a single, self-contained HTML file (with embedded CSS/JS) that simulates 2D Ostwald Ripening of circular particles on an HTML canvas.

Layout & UI Requirements

Layout: Must fit entirely onto one desktop screen without page overflow. Left panel for UI controls, right panel for the simulation canvas.

Controls (Inputs):

Initial number of particles N

Initial radius minimum

Initial radius maximum

Minimum radius threshold (Rmin)

M0 (Pre-exponential factor)

Q (Activation energy in eV)

T (Temperature in K)

Time step dt

Buttons: Start, Pause, Reset.

Status & Plots (Optional but highly requested): * Live text display of: Time, Active Particle Count (N), Average Radius, and Critical Radius (Rc).

A small live line chart or histogram plotting Average Radius and Critical Radius vs. time.

A toggle for "Brownian Motion" to gently jiggle particles to keep them visually distinct.

Simulation Logic & Physics

Thermodynamics & Kinetics:

Boltzmann constant: kB = 8.617333262145e-5 eV/K

Arrhenius mobility: M = M0 * exp(-Q / (kB * T))

Critical radius: Rc = ( (1/N) * sum(1 / ri) )^(-1)

Rate of change: dri/dt = (M / ri^2) * (ri / Rc - 1)

Numerical Mechanics (CRITICAL FOR STABILITY):

Substepping: Because of the 1/r^2 term, small particles evolve and vanish extremely rapidly, which can cause the simulation to blow up. You MUST implement numerical substepping inside the main dt loop. Divide the user's dt into smaller internal substeps to integrate the radius smoothly.

Update Rule: ri = ri + dt_sub * (M / ri^2) * (ri / Rc - 1)

Death Condition: If ri < Rmin, remove that particle from the arrays immediately so it no longer affects Rc.

Visuals & Spatial Constraints:

Distribute particle centers randomly (Gaussian or uniform) across the full visible box area on initialization.

Keep all particles fully visible in the box (prevent clipping on edges).

Strict Rules: Do NOT implement overlap relaxation, spatial attraction between particles, or center "sucking". The position of the particles does not affect the ripening math in this mean-field model.