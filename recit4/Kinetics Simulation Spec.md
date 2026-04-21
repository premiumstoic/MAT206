# **Software Requirements Specification: 2D Particle Diffusion Simulation**

## **1\. Project Overview**

The objective is to build a web-based, real-time 2D simulation of particle diffusion using a continuous random walk model (Brownian motion). The simulation must avoid discrete grid-based jumps (no Monte Carlo teleportation) and instead use continuous spatial updates based on Gaussian probability distributions. The system models spatial heterogeneity through two distinct environments with temperature-dependent diffusion coefficients.

**Tech Stack:** HTML5, CSS3, JavaScript (Canvas API).

## **2\. Mathematical & Physical Model**

### **2.1. Arrhenius Kinetics**

The diffusion coefficient $D$ for any region is determined by the temperature and the region's activation energy using the Arrhenius equation:

D \= D0 \* exp(-Ea / (R \* T))

* $D\_0$: Diffusion pre-exponential factor ($\\mu m^2/s$).  
* $E\_a$: Activation energy (J/mol).  
* $T$: Temperature (Kelvin).  
* $R$: Ideal gas constant \= 8.314462618 J/mol/K.

### **2.2. Unit Conversion**

The UI accepts parameters in physical units ($\\mu m$), but the canvas renders in pixels.

* Let a \= user-defined conversion factor ($\\mu m$ per pixel).  
* D\_pixels \= D\_microns / (a \* a)  
* This calculated D\_pixels must be used for all on-screen spatial updates.

### **2.3. Continuous Random Walk (Brownian Motion)**

For each particle, at every simulation time step dt, the displacement in $x$ and $y$ must be sampled independently from a Gaussian (Normal) distribution with a mean of 0 and a variance of 2 \* D\_pixels \* dt.

* $dx \\sim \\mathcal{N}(0,, 2 \\cdot D\_{pixels} \\cdot dt)$  
* $dy \\sim \\mathcal{N}(0,, 2 \\cdot D\_{pixels} \\cdot dt)$  
* *Implementation Note:* JavaScript's Math.random() is uniform. The agent must implement a Gaussian random number generator (e.g., the Box-Muller transform) where the standard deviation $\\sigma \= \\sqrt{2 \\cdot D\_{pixels} \\cdot dt}$.

## **3\. Environments & Spatial Logic**

The canvas is divided into environments that dictate the local $D$ value for a particle. A particle's step size is determined *strictly by its current location* at the start of the dt step.

### **3.1. Environment 1 (Background)**

* Occupies the entire canvas domain by default.  
* Default parameters: D0\_1 \= 50, Ea\_1 \= 12000\.

### **3.2. Environment 2 (Subregion)**

* A user-defined overlay area. Must have a visual representation (overlay color with opacity) and a toggle to Show/Hide visually (even if hidden, physics still apply unless completely disabled by setting percentage to 0).  
* Default parameters: D0\_2 \= 10, Ea\_2 \= 18000\. (Slower diffusion).  
* **Geometry & Location Rules** (Based on a user-defined "Percentage" p):  
  * **Top:** A rectangular band occupying the top p% of the canvas height.  
  * **Bottom:** A rectangular band occupying the bottom p% of the canvas height.  
  * **Left:** A rectangular band occupying the left p% of the canvas width.  
  * **Right:** A rectangular band occupying the right p% of the canvas width.  
  * **Membrane:** A rectangular vertical band situated exactly in the center of the $x$-axis, spanning from top to bottom, with a width equal to p% of the canvas width.  
  * **Center:** A circular region perfectly centered on the canvas. Its radius is p% of the *maximum possible center radius* (where max radius \= min(canvas.width, canvas.height) / 2).

## **4\. Boundary Conditions & Collision Logic**

* **Domain:** 2D rectangular HTML5 Canvas.  
* **Particles:** Drawn as filled circles with a user-defined radius in pixels.  
* **Reflecting Boundaries:** Particles are strictly forbidden from leaving the canvas.  
* **Collision Math:** The particle's *radius* must be accounted for.  
  * If canvas width is $W$ and radius is $r$, the maximum allowed $x$-center is $W \- r$.  
  * If a particle's calculated next step puts its center at $X\_{new}$ which is $\> (W \- r)$, it must bounce.  
  * The overshoot is: overshoot \= X\_{new} \- (W \- r).  
  * The corrected position is: X\_final \= (W \- r) \- overshoot.  
  * This logic applies to all four walls ($x=r$, $x=W-r$, $y=r$, $y=H-r$).

## **5\. Particle Initialization**

When the "Reset" button is clicked, particles are generated based on two UI dropdowns: **Initial Distribution** and **Initial Fill Percentage** ($p$).

1. **Left Side:** Placed uniformly randomly within the left $p$% of the canvas width.  
2. **Right Side:** Placed uniformly randomly within the right $p$% of the canvas width.  
3. **Top:** Placed uniformly randomly within the top $p$% of the canvas height.  
4. **Bottom:** Placed uniformly randomly within the bottom $p$% of the canvas height.  
5. **Center (Circular):** Placed uniformly randomly inside a centered circle. The radius of this circle is $p$% of the max possible center radius.  
6. **Uniform (Entire Domain):** Placed uniformly across the entire canvas. (Ignores the percentage input).  
7. **Uniform (Outside Env 2):** Placed uniformly across the canvas, but strictly *excluding* the area defined by Environment 2\. (Important: The agent must write a rejection sampling loop or exact area calculation to ensure zero particles spawn inside Env 2).

## **6\. User Interface (UI) Requirements**

The UI must be polished, professional, clean, and grouped logically (e.g., using CSS Grid or Flexbox, and semantic HTML fieldsets/cards).

### **6.1. General Settings**

* Number of Particles (integer)  
* Particle Radius (pixels)  
* Particle Color (color picker)  
* $\\mu m$ per pixel conversion factor (a)  
* Temperature (Kelvin)  
* Time step dt (seconds)

### **6.2. Initialization Settings**

* Initial Distribution Selector (Dropdown matching Section 5\)  
* Initial Fill Percentage (Number input, 0-100)

### **6.3. Environment 1 Settings**

* Pre-exponential factor ($D\_{0,1}$)  
* Activation energy ($E\_{a,1}$)

### **6.4. Environment 2 Settings**

* Location Selector (Top, Bottom, Left, Right, Center, Membrane)  
* Percentage Coverage (Number input, 0-100)  
* Pre-exponential factor ($D\_{0,2}$)  
* Activation energy ($E\_{a,2}$)  
* Overlay Color (color picker with alpha/opacity support)  
* Show/Hide Toggle (Checkbox or switch to toggle visual overlay of Env 2\)

### **6.5. Simulation Controls**

* **Start/Resume:** Begins the requestAnimationFrame loop.  
* **Pause:** Halts the loop.  
* **Reset:** Clears the canvas, recalculates parameters, and spawns a fresh batch of particles based on the Initialization Settings.

## **7\. Architecture / Code Instructions for AI**

1. **Single File:** Provide the solution as a single HTML file containing embedded CSS and JS for easy execution.  
2. **Performance:** Use standard 2D Canvas API. For large particle counts, ensure the rendering loop ctx.clearRect and ctx.arc calls are optimized (e.g., using ctx.beginPath() efficiently).  
3. **Encapsulation:** Organize the code cleanly into classes or modular functions (e.g., Particle, Environment, SimulationController).  
4. **Live Updates:** Changes to Temperature, D0, Ea, or Environment 2 geometry should ideally apply in real-time to active particles without needing a hard reset, but changes to Initial Distribution require a Reset.