# **Kinetics of Materials: Monte Carlo Simulation Prompting Guide**

**Context for the User:** Use this document to guide the AI in your Antigravity IDE. Feed it the "System Context" first, and then provide Prompts 1 through 5 sequentially. **Wait for the AI to finish and verify the code works before moving to the next prompt.**

## **⚙️ Initial System Context (Feed this first)**

"You are an expert scientific programmer specializing in materials science and thermodynamics. We are going to build a 2D Monte Carlo simulation in HTML/JS that models atomic diffusion and phase changes based on the Boltzmann distribution. To ensure the code is bug-free, I will feed you the requirements step-by-step. Do not write the entire simulation at once. Only write the code requested in each step. Acknowledge this context and wait for Step 1."

## **🧱 Step 1: The Grid, Interactivity, and Visuals**

"Let's start by building the UI skeleton and the grid rendering logic in a single HTML file using standard HTML, CSS, and JS.

Requirements:

1. Create a canvas that dynamically stretches to fit the available screen space.  
2. Create UI inputs for grid dimensions: 'n' (width) and 'm' (height).  
3. Create a UI input for 'Initial Filled Cells' (default 10). These represent 'A' atoms.  
4. Create a 'Regenerate' button. When clicked, it should draw an n x m grid on the canvas and randomly fill the specified number of cells.  
5. Add interactivity: When a user clicks on a cell on the canvas, it should toggle between filled and empty.  
6. Add a live text counter in the UI that updates to show the current number of filled cells on the board.  
7. Add HTML color pickers in the UI to let the user change the color of 'filled' and 'empty' cells dynamically.

*Stop here. Do not implement any time steps, simulation loops, or thermodynamics yet. Explain what you did when you output the code.*"

## **⏱️ Step 2: The Simulation Loop & Random Selection**

"Great. Now let's set up the engine's heartbeat. We need to add the simulation loop and the logic for picking cells.

Requirements:

1. Add UI inputs for 'Time Step (ms)' (default 10).  
2. Add 'Start' and 'Pause' buttons to control the simulation loop using setInterval and clearInterval.  
3. Inside the simulation loop (which runs every time step), write the logic to pick two random cells on the grid.  
4. Add a check: If both random cells are filled, or both are empty, do nothing and skip to the next time step.  
5. If one cell is filled and the other is empty, console.log('Valid pair found\!') for now.

*Stop here. Do not calculate neighbor energies or perform any actual swapping. Explain what you did.*"

## **🌡️ Step 3: Thermodynamics & Energy Calculation**

"Perfect. Now let's add the physics for the 'Valid pair' we found in the last step.

Requirements:

1. Add UI inputs for 'A-A Interaction Energy' (default \-50) and 'Temperature' (default 100).  
2. Create a function to calculate the energy of a filled cell. It should check the cell's top, bottom, left, and right neighbors. For every neighbor that is ALSO filled, add the 'A-A Interaction Energy' to the total.  
3. In our simulation loop, when we have a valid pair (one filled, one empty), calculate 'E1': the current energy of the filled cell based on its neighbors.  
4. Next, calculate 'E2': the theoretical energy the filled cell WOULD have if it moved to the empty cell's coordinate (count the filled neighbors around the empty cell's coordinate).  
5. Console.log E1 and E2.

*Stop here. Do not write the Boltzmann math or swap the cells yet. Explain what you did.*"

## **🎲 Step 4: The Monte Carlo Swap**

"Now for the final Monte Carlo probability logic to actually execute the swap.

Requirements:

1. Using E1, E2, and the Temperature (T) from the UI, calculate q \= Math.exp((E1 \- E2) / T).  
2. Calculate the probability p \= q / (1 \+ q).  
3. Generate a random number between 0 and 1\.  
4. If the random number is less than or equal to p, execute the swap: make the filled cell empty, and the empty cell filled.  
5. Ensure the canvas redraws to reflect the new state.

*Explain how this specific math introduces the randomness necessary to simulate entropy, as temperature scales. Ensure the code is complete and runs the full simulation.*"

## **📝 Step 5: Scientific Notes and Polish**

"The simulation is working beautifully. The final requirement is to add some scientific educational notes to the UI, as requested by my professor.

Requirements:

1. Add a neatly formatted text section below the controls.  
2. In your own words, briefly explain how the simulation models a melting/freezing or boiling/condensation process.  
3. Explain the concept of thermodynamic equilibrium in this context.  
4. Answer this specific question in the text: 'In the equation we did not add an entropy term, but the simulation reaches equilibrium. Where is the entropy term?' (Hint: explain the role of the random number generator and temperature).  
5. Clean up the CSS so the whole application looks professional, modern, and clean."