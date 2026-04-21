Kinetics Assignment: Monte Carlo Grain Growth Analysis

Based on the curvature- and energy-driven Monte Carlo lattice model, here are the physical analyses for the observed grain evolution behaviors.

1. What is the effect of having bulk/boundary energy difference being too big or very close?

Energies are very close: If the bulk and grain energies are nearly identical, the change in energy ($\Delta E$) for any proposed flip is very small. According to the Glauber acceptance probability ($P_{accept} = 1 / (1 + \exp(\Delta E / T))$), a $\Delta E$ near zero pushes the probability toward 50%. The boundaries lose their structural integrity and dissolve into random, fuzzy noise because thermal fluctuations easily overpower the weak boundary energy penalty.

Energies are too big (far apart): If the difference is massive, $\Delta E$ becomes very large. Unfavorable moves get an acceptance probability of virtually 0%, while favorable moves get exactly 100%. The system becomes entirely deterministic. Without the random "thermal jiggling" that allows boundaries to escape local energy traps, the microstructure will quickly freeze and stop evolving.

2. Which curvature wins (negative or positive)? Why?

Convex surfaces (curving outward, typical of small grains) "lose" and are consumed by concave surfaces (curving inward, typical of the surrounding large grains).
Why: A lattice cell protruding outward on a convex boundary is surrounded by a higher number of unlike neighbors compared to a cell on a flat surface. This gives it a higher local energy penalty. To minimize this energy, the protruding cell is highly likely to flip its orientation to match the surrounding grain. Consequently, grain boundaries inherently migrate toward their center of curvature.

3. What happens to the grain size? Why?

The average grain size continuously increases over time.
Why: Because boundaries migrate toward their center of curvature, small, highly-curved grains act like shrinking balloons until they completely disappear. As these smaller grains are eliminated from the system, the total number of distinct grains decreases. Since the total simulation area remains constant, dividing the same area by a smaller number of grains yields a mathematically larger average grain size.

4. Does low or high temperature change these tendencies?

Yes. Temperature dictates the strictness of the energy rules.

High Temperature: Increases the denominator in the $\Delta E / T$ term, driving the acceptance probability closer to 50% for all moves. This introduces more random "noise" and allows the boundaries to occasionally move against the energy gradient, making the growth less strictly directional.

Low Temperature: Makes the system highly directional, only accepting moves that strictly lower the local energy.

5. Does the temperature change the grain size change rate?

Yes, a higher temperature actually increases the overall rate of grain growth.
Why: While low temperatures make the system strictly favor lower energy states, boundaries in a lattice are jagged. Smoothing a boundary often requires a temporary, unfavorable energy increase to get over a local energy "bump." At very low temperatures, the system lacks the thermal energy to make these unfavorable moves, causing the boundaries to freeze in local minima. A higher temperature provides the necessary thermal "jiggling" to overcome these temporary barriers, allowing the boundaries to freely migrate and the grains to grow much faster.