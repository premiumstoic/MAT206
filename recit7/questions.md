Kinetics Assignment: Power-Voronoi Grain Growth Analysis

Based on the Arrhenius mobility equation and von Neumann-Mullins kinetics, here is the analysis of the geometric macroscopic simulation.

1. How does the initial heterogeneity affect early-stage growth?

If the initial size spread is large (high initial heterogeneity), the early stages of the simulation will exhibit extremely rapid, almost "abnormal" coarsening. The initial state contains very small grains next to very large grains. Because of the von Neumann-Mullins relation ($dA/dt \propto n - 6$), the small grains ($n < 6$) rapidly collapse, while the large grains ($n > 6$) rapidly consume them. However, as the highly unstable smallest grains are eliminated, the microstructure eventually self-corrects and evolves toward a smoother, steady-state "normal" grain size distribution.

2. Which grains shrink and which grow? Does it match dA/dt = K(n-6)?

Yes, the simulation precisely follows the geometric prediction. Observing the labels on the centroids:

Grains with 3, 4, or 5 sides consistently lose area and eventually vanish.

Grains with exactly 6 sides are metastable; their area only changes when neighbor topology shifts and changes their side count.

Grains with 7 or more sides consistently grow.
This confirms that boundary curvature (forced by the 120° angle requirement at triple junctions) dictates growth purely by topological side count in an ideal 2D system.

3. What happens to the coarsening rate when Temperature increases?

Increasing the temperature dramatically accelerates the coarsening rate.
Why: The boundary mobility follows the Arrhenius equation: $M(T) = M_0 \exp(-Q_m / RT)$. The temperature $T$ is in the denominator of the negative exponent. As $T$ increases, the fraction $-Q_m/RT$ becomes a smaller negative number (closer to zero). Therefore, the exponential term rapidly approaches 1, resulting in an exponentially higher mobility $M$. Faster mobility means the boundaries respond to curvature much faster.

4. How does increasing Activation Energy (Qm) change the evolution rate?

Increasing the activation energy $Q_m$ drastically slows down the evolution rate.
Why: $Q_m$ represents the energy barrier atoms must overcome to jump across the boundary. In the exponential term $\exp(-Q_m / RT)$, a larger $Q_m$ makes the exponent a much larger negative number. This drives the exponential value closer to zero, severely restricting boundary mobility.

5. Changing M0 vs. changing Qm: Scale vs. Thermal Sensitivity

Changing $M_0$ (Pre-exponential factor): $M_0$ is a linear multiplier. Changing it alters the overall baseline "scale" of the mobility across all temperatures equally. Doubling $M_0$ exactly doubles the speed of the simulation.

Changing $Q_m$ (Activation Energy): $Q_m$ sits inside the exponent and governs the thermal sensitivity. It dictates how strongly the material responds to changes in temperature. A high $Q_m$ means the material will be incredibly sluggish at low temperatures but will experience a massive, steep spike in mobility as it is heated.

6. Compare the effects of gamma and M0. Do they produce similar changes?

Yes, changing either the grain boundary energy ($\gamma$) or the pre-exponential mobility factor ($M_0$) produces identical qualitative changes in the overall growth rate.
Why: Both parameters act as simple linear multipliers in the von Neumann-Mullins prefactor equation: $K = (\pi / 3) \gamma M$. Because $M$ is directly proportional to $M_0$, doubling either the surface tension ($\gamma$) or the base mobility ($M_0$) simply doubles the value of $K$. This mathematically doubles $\Delta A$ in the timestep calculation, scaling the geometric evolution equally.