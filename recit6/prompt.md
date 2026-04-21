Context

You are an expert scientific programmer. I need you to write a single, self-contained HTML file containing embedded CSS and JavaScript to simulate 2D grain growth based on a Monte Carlo lattice model. The model represents grain growth as curvature- and energy-driven grain boundary migration in a simplified orientation lattice.

Layout & UI Requirements

The layout should feature a side UI panel and a simulation canvas that fills the rest of the window dynamically.

Include the following input boxes with exact default values:

Vertical cell number (Rows): 40

Horizontal cell number (Cols): 60

Bulk energy: -50

Grain energy: 50

Temperature (T): 100

Time interval: 1 ms

Parallel MC calculations (trials per frame): 100

Add a dropdown or radio toggle to switch between 3 Orientations and 6 Orientations (use distinct, aesthetic colors).

Buttons required: "Start / Pause", "Regenerate" (seed-based), and "Mix" (completely randomizes the grid to simulate tiny grains).

Clicking any cell on the canvas must manually cycle its orientation through the active orientation set.

Simulation Rules & Physics

Grid & Boundaries: Use an 8-neighbor Moore neighborhood. Implement strict periodic boundary conditions (the grid wraps around like a torus). Use modulo arithmetic to wrap array indices (be careful with negative numbers in JS modulo).

Initialization (Regenerate): When regenerating, do NOT just randomly paint the grid. Place one random seed for each active orientation. Assign every lattice cell to the nearest seed using periodic distance (shortest wrap-around distance), so it starts with large Voronoi-like domains.

Monte Carlo Trial Logic (Crucial for performance):

Pick one random cell.

Check its 8 neighbors (using periodic wrapping).

Optimization: If all 8 neighbors have the same orientation as the chosen cell, REJECT the site immediately and skip to the next trial to save compute.

Create an "invasion pool" consisting ONLY of neighbors with a different orientation.

Randomly choose one orientation from this pool as the proposed invading orientation.

Energy Calculation: * $E_{initial}$: Sum the interactions of the selected cell with its 8 neighbors. For matching neighbors, add bulk_energy. For different neighbors, add grain_energy.

$E_{final}$: Calculate the same sum, but assuming the selected cell has changed to the invading orientation.

$\Delta E = E_{final} - E_{initial}$.

Glauber Acceptance Kinetics:

Acceptance probability: $P_{accept} = 1 / (1 + \exp(\Delta E / T))$.

Numerical Stability: If $\Delta E / T$ is very large (e.g., > 50), handle the exponential gracefully to avoid NaN or Infinity (e.g., probability becomes 0).

Generate a random number [0, 1). If less than $P_{accept}$, apply the new orientation.

Optional Features to Implement (Bonus points)

Please add a dedicated "Statistics Panel" in the UI that updates live:

Percent Boundary Sites: Percentage of cells that have at least one neighbor of a different orientation.

Mean Grain Size: Total cells / Estimated number of distinct grains.

Live Energy Plot: A small embedded <canvas> graph in the UI panel charting the total internal energy of the system over time, clearly demonstrating that the system minimizes its energy as boundaries smooth out.

Ensure the code is fully styled (a dark scientific theme is preferred), well-commented, and runnable immediately upon opening in a browser.