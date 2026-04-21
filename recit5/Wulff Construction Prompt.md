# **Role and Context**

You are an expert Frontend Developer and Physicist. Your task is to build a highly interactive, single-file HTML application (HTML, CSS, and vanilla JavaScript combined) that simulates a 2D Wulff Construction for a square-lattice crystal model.

# **Application Requirements**

* **Single File:** All code must be contained in one .html file. You may use Tailwind CSS via CDN for modern, clean styling.  
* **Reactivity:** The canvas drawing must update *instantly* whenever any input value changes. No "submit" buttons.  
* **Responsiveness:** The layout should consist of a control panel on one side (or top) and a large HTML \<canvas\> on the other. The canvas must resize properly with the browser window, maintaining the origin (0,0) at the center.

# **User Controls (Inputs)**

Create the following inputs in the control panel:

1. **Coordination Type (Dropdown):** "4-coordination" and "8-coordination".  
2. **Eh (Number):** Horizontal interfacial energy parameter. Default: 1.0, Step: 0.1  
3. **Ev (Number):** Vertical interfacial energy parameter. Default: 1.0, Step: 0.1  
4. **Ed (Number):** Diagonal interfacial energy parameter. Default: 1.0, Step: 0.1  
5. **S (Number):** Visual scale factor. Default: 50\.  
6. **Band Color (Color Picker):** Semi-transparent color for the allowed boundary bands.  
7. **Wulff Shape Color (Color Picker):** Solid color for the final crystal equilibrium shape.

# **Mathematical & Physical Model**

The simulation calculates the distances to bounding planes based on broken-bond densities. Use these exact formulas:

**Distances:**

* d \= m\_hv \* Eh \* S (Distance to vertical boundaries)  
* e \= m\_hv \* Ev \* S (Distance to horizontal boundaries)  
* r \= m\_diag \* Ed \* S (Distance to diagonal boundaries)

**Broken-Bond Multipliers (m):**

* **If 4-coordination is selected:**  
  * m\_hv \= 1  
  * m\_diag \= Math.sqrt(2)  
* **If 8-coordination is selected:**  
  * m\_hv \= 3  
  * m\_diag \= 3 / Math.sqrt(2)

# **Rendering Instructions (Canvas)**

The canvas should redraw the following elements on every state change:

1. **Background & Axes:** Draw a faint square lattice grid in the background. Draw bold X and Y coordinate axes passing through the center of the canvas. Label the origin.  
2. **Allowed Bands (Semi-transparent fills):**  
   * **Vertical Band:** Fill the area between x \= \-d and x \= \+d.  
   * **Horizontal Band:** Fill the area between y \= \-e and y \= \+e.  
   * **Diagonal Band 1:** Fill the area between x \+ y \= \-r and x \+ y \= \+r (slope \-1).  
   * **Diagonal Band 2:** Fill the area between x \- y \= \-r and x \- y \= \+r (slope \+1).  
   * *Note:* Draw lines for all these equations and label them on the canvas.  
3. **The Wulff Shape (Inner Envelope):** \* The equilibrium shape is the geometric intersection of all the allowed half-planes.  
   * Calculate the polygon that satisfies *all* of these inequalities simultaneously:  
     * x \<= d AND x \>= \-d  
     * y \<= e AND y \>= \-e  
     * x \+ y \<= r AND x \+ y \>= \-r  
     * x \- y \<= r AND x \- y \>= \-r  
   * Fill this resulting polygon with the user-selected Wulff Color and draw a bold outline around it.

# **Technical Implementation Hint: Polygon Intersection Algorithm**

To easily compute the vertices of the Wulff shape in vanilla JS:

1. Define the 8 boundary lines algebraically.  
2. Calculate the intersection point of every possible pair of lines (28 total points).  
3. Filter this list of points: Keep only the points that satisfy *all 8 inequalities* listed above. (Use a small epsilon like 1e-9 to account for floating-point errors).  
4. Sort the remaining valid points by their polar angle Math.atan2(y, x) relative to the origin.  
5. Draw the resulting polygon using ctx.beginPath(), ctx.lineTo(), and ctx.fill().

# **Bonus/Optional**

Include a small inset drawing or an extra section in the UI showing a sketch of a simple square unit lattice, visually indicating the broken bonds for both a straight cut and a diagonal cut.