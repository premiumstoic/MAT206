# Kinetics Assignment: Droplet Nucleation and Growth

### 1. Effect of increasing Temperature at fixed vapor pressure (p)
Increasing temperature exponentially increases the saturation vapor pressure ($p_{sat}$) according to the Antoine equation. Since the air can now hold much more water, the relative humidity ($p / p_{sat}$) drops. Consequently, the chemical potential difference ($\Delta \mu = kT \ln(p/p_{sat})$) decreases or becomes negative. The nucleation tendency plummets, and the system may cross from supersaturated to undersaturated.

### 2. Moving from Dry to Tropical Air at a fixed Temperature
Moving to tropical air increases the actual vapor partial pressure ($p$). Because $p$ increases while $p_{sat}$ is fixed by temperature, the ratio $p/p_{sat}$ increases. This increases the chemical potential driving force ($\Delta \mu$) and the volumetric free energy ($|\Delta g_v|$). A higher volumetric pull easily overcomes surface energy, drastically reducing the critical radius ($r^* = 2\gamma/|\Delta g_v|$) and the nucleation barrier, leading to a massive spike in nucleation probability.

### 3. Crossing from Undersaturated to Supersaturated
In undersaturated conditions ($p \le p_{sat}$), $\Delta \mu$ is zero or negative. Droplets will spontaneously evaporate to lower the system's energy. Upon crossing into supersaturation ($p > p_{sat}$), $\Delta \mu$ becomes positive. Condensation becomes thermodynamically favorable, giving the system a finite critical radius and an energy barrier that can be overcome by thermal fluctuations to form stable droplets.

### 4. Effect of Surface Energy (gamma) and Contact Angle (theta)
* **Increasing gamma:** Surface energy is the penalty for creating a droplet. Increasing $\gamma$ linearly increases the critical radius ($r^* \propto \gamma$) and massively increases the nucleation barrier ($\Delta G^* \propto \gamma^3$). 
* **Contact Angle:** Heterogeneous nucleation is strongly favored at low contact angles (hydrophilic dust, $\theta < 90^\circ$). As $\theta$ approaches $0^\circ$, the wetting factor $f(\theta)$ approaches 0, meaning the energy barrier virtually disappears and water condenses on the dust almost instantly.

### 5. Kinetic Parameters: A, M0, and Q
* **Probability Prefactor (A):** Increasing $A$ shifts the overall statistical frequency of nucleation events upward without changing the thermodynamic barrier. It dictates how often the system "attempts" to overcome the barrier.
* **Mobility Prefactor (M0):** $M_0$ only affects the post-nucleation growth rate. It does **not** affect whether a droplet nucleates in the first place, as it is not part of the $\Delta G^*$ equation.
* **Activation Energy (Q):** Increasing $Q$ slows down the growth rate exponentially ($M \propto \exp(-Q/kT)$). The suppression is particularly extreme at low temperatures, where thermal energy $kT$ is too weak to overcome the high $Q$ barrier.

### 6. Complex Parameter Scenarios
* **Favorable Thermodynamics, No Droplets:** Yes, this is possible. If the volumetric driving force is favorable but the surface energy ($\gamma$) is exceptionally high, the barrier $\Delta G^*$ prevents nucleation. Alternatively, if $Q$ is massive, nuclei might form but grow so slowly they remain sub-microscopic for the duration of the observation.
* **Ready Nucleation, No Rain:** This occurs when thermodynamic barriers are low (e.g., highly hydrophilic dust, high $A$, high supersaturation) causing millions of tiny droplets to nucleate instantly. However, if the growth kinetics are terrible (extremely low $M_0$ or very high $Q$), these droplets will remain trapped at a microscopic size and never reach the visual "rain" threshold.