# Context
You are an expert scientific programmer. I need a single, self-contained HTML file (with embedded CSS/JS) that simulates 2D water droplet nucleation and growth.

# Layout & UI Requirements
* **Layout:** Must fit on one screen without scrolling. Left panel for UI, right panel for the simulation Canvas.
* **UI Controls:**
  * Gamma (Surface Energy) input, with a dropdown to toggle between J/m² and eV/Å². (Convert to SI internally).
  * Atmosphere Dropdown: Dry air, Average air, Humid air, Tropical air (Display assumed partial pressure $p$ and dew point in labels).
  * Temperature in °C (Convert to K internally).
  * Contact Angle $\theta$ slider (0 to 180 degrees).
  * Probability Prefactor $A$.
  * M0 ($m^4 J^{-1} s^{-1}$) and Activation Energy Q (kJ/mol - convert to J/molecule internally using Avogadro).
  * Max radius increment per step (nm).
  * Rain threshold radius (pixels) - When a droplet hits this, it must fade out and be removed.
  * Visual scale (nm/pixel).
  * Dust count.
  * physical dt (seconds) and UI interval (ms).
  * Checkboxes to independently enable/disable Homogeneous and Heterogeneous nucleation.
* **Status Panel (Live Updates):**
  * Counters: Homogeneous formed, Heterogeneous formed, Failed attempts, Rain droplets removed.
  * Display $p_{sat}$, $\Delta \mu$, $|\Delta g_v|$, and Critical Radii ($r_{hom}$ and $r_{het}$) in nm.

# Simulation Logic & Physics
1. **Thermodynamics:**
   * Compute $p_{sat}$ using the Antoine equation for water (using °C).
   * If $p \le p_{sat}$: Undersaturated. $\Delta \mu = 0$. Suppress nucleation/growth.
   * If supersaturated: $\Delta \mu = kT \ln(p/p_{sat})$. 
   * Volumetric driving force: $|\Delta g_v| = n_l \times |\Delta \mu|$ (calculate $n_l$ from liquid water density and molecular weight).
2. **Nucleation:**
   * $\Delta G_{hom} = 16\pi\gamma^3 / (3 |\Delta g_v|^2)$. Critical radius $r_{hom} = 2\gamma / |\Delta g_v|$.
   * Wetting factor: $f(\theta) = (2 - 3\cos\theta + \cos^3\theta) / 4$.
   * $\Delta G_{het} = f(\theta) \times \Delta G_{hom}$. 
   * Probability test: $P = \text{clamp}(A \times dt \times \exp(-\Delta G / kT), 0, 1)$.
   * *Loop Mechanics:* Every step, perform exactly one Homogeneous test and one Heterogeneous test. If Homogeneous succeeds, place a seed randomly in the bulk. If Heterogeneous succeeds, place a seed exactly on a random dust particle.
3. **Growth Kinetics:**
   * Arrhenius mobility: $M(T) = M_0 \exp(-Q / kT)$.
   * Update radius: $dr = M(T) \times |\Delta g_v| \times dt$. Limit by the user's max radius increment.
   * Droplets currently fading out (rain) must stop growing.
4. **Visuals:**
   * Draw dust particles as static, small dark pixel markers.
   * Draw droplets as semi-transparent blue circles. Convert physical radius (nm) to canvas radius (px) using the visual scale.