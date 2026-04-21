Context

You are an expert scientific programmer. I need you to write a single, self-contained HTML file (with embedded CSS/JS) that simulates 2D "Power-Voronoi Grain Growth" based on curvature-driven materials kinetics.

Layout & UI Requirements

Layout: Must fit entirely onto one desktop screen without page overflow. Left panel for UI controls, right panel for the simulation canvas (fills the remaining height).

Top Buttons (Left Panel): Reset, Start, Pause.

Live Slider: "Initial size spread (%)" (0 to 100). Crucial: Dragging this slider must immediately regenerate the starting microstructure, recompute calibration, redraw grains, and reset time to zero (without needing the Reset button).

Numeric Inputs:

Number of seeds (Default: 300)

Temperature (K) (Default: 1173)

Qm (kJ/mol) (Default: 200)

gamma (J/m²) (Default: 0.7)

M0 (m⁴/(Js)) (Default: 1e-4)

Micrometers per pixel (Default: 1.0)

dt (seconds) (Default: 1.0)

recompute C every N steps (Default: 10)

eps for dA/dw (px²) (Default: 1.0)

Minimum grain area (µm²) (Default: 5.0)

Max seeds safety cap (Default: 1000)

Status Section (Live Updates): Simulation time, active grain count, mean grain area (µm²), mean number of sides. Include a line showing physical/calibration vars $K$, $M$, and $C$ in scientific notation.

Live Plots: Add two small <canvas> plots at the bottom of the UI panel tracking "Mean Area vs. Time" and "Grain Count vs. Time".

Simulation Logic & Physics

Geometry Engine: * Represent the 2D structure using a power-Voronoi construction (each grain is a seed point + weight).

Use the power distance formulation.

Mandatory: Implement polygon clipping using the Sutherland-Hodgman half-plane clipping method. Clip against all competing seeds starting from the rectangular simulation domain.

Initialization:

Place seeds in a roughly grid-like arrangement with random jitter to spread them well.

relSpread = spreadPercent / 100

meanCellArea = (canvas.width * canvas.height) / nSeeds

Initial weight: $w = r \times \text{relSpread} \times \text{meanCellArea}$ (where $r$ is a random number between -1 and 1).

Materials Kinetics Engine:

$R = 8.31446261815324$ J/(mol*K).

Mobility: $M(T) = M_0 \exp(-Q_m / (RT))$. ($Q_m$ is input in kJ, convert to J internally).

von Neumann-Mullins Prefactor: $K = (\pi / 3) \gamma M$.

Target area change per step: $\Delta A = K(n - 6)dt$ (in SI units). Convert this to $\Delta A_{px}$ using the µm/pixel scale.

Numerical Weight Update (The Trick):

Do not explicitly solve local curvature. Use von Neumann-Mullins as the target.

Estimate sensitivity numerically using perturbation eps_w: $dA/dw \approx (A(w + \text{eps\_w}) - A(w)) / \text{eps\_w}$.

Compute global calibration factor: $C = 1 / \text{mean}(dA/dw)$. Smooth changes in $C$ with damping to avoid unstable jumps. Recompute every N steps.

Update weights: $\Delta w = C \times \Delta A_{px}$.

Maintenance & Drawing:

Use requestAnimationFrame for the loop.

Topological Disappearance: If a grain's area falls below the minimum threshold, mark it dead and remove it. Compact the array to maintain efficiency. If seeds exceed max cap, cull the smallest.

Drawing: Fill grains with distinct glossy/aesthetic colors. Draw the number of sides ($n$) exactly at the centroid of each grain using high-contrast text (dark fill, white outline).

Please output only the highly-optimized, complete, runnable HTML code.