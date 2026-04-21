# **Kinetics Course Assignment: 2D Monte Carlo Binary Phase Transformation**

## **1\. Executive Summary**

This assignment requires the development of a single-file web application (HTML/JS/CSS) that simulates a binary phase transformation on a 2D lattice using a Monte Carlo (MC) algorithm. The simulation models how a mixture of two elements (A and B) and vacancies (empty spaces) evolve over time through two distinct kinetic mechanisms: atomic diffusion and structural phase changes (coordination flips).

The goal is to observe how microscopic thermodynamic rules (interaction energies) and kinetic rules (probabilities and rate limits) dictate macroscopic material behaviors, such as phase separation and crystal structure formation.

## **2\. Core Physical Concepts**

### **2.1 Mechanisms and Rate Limits**

The simulation models two distinct physical processes, governed by a "Diffusion vs. Flip" probability slider (default 80% diffusion, 20% flip):

* **Diffusion (Swap Moves):** Represents mass transport. An atom physically migrates to an adjacent empty lattice site.  
* **Reaction/Flip (Coordination Changes):** Represents a local phase transformation. The atom remains physically stationary but changes its crystal packing configuration (shifting between 4-coordination and 8-coordination).  
* **Rate-Limiting Steps:** By adjusting the slider, the simulation mimics different real-world scenarios. The default 80/20 setting simulates a **reaction-limited** process (e.g., the slow oxidation of iron), where atoms move around easily but the actual structural transformation is slow and acts as the bottleneck.

### **2.2 Thermodynamics and Interaction Energies**

The system's evolution is driven by the desire to minimize its overall internal energy. The local energy of any atom depends strictly on its immediate neighbors.

The default interaction energies are:

* **A-A:** \-10 (Weakly attractive)  
* **B-B:** \-50 (Strongly attractive)  
* **A-B:** \+50 (Highly repulsive)

Because same-species interactions are negative (favorable) and cross-species interactions are positive (unfavorable), the system is thermodynamically driven to **phase separate**. A and B atoms will actively avoid each other and clump with their own kind, with B atoms forming the most tightly bound clusters.

### **2.3 Monte Carlo and Glauber Dynamics**

The simulation uses Glauber dynamics to calculate the probability of a proposed move occurring, incorporating temperature (![][image1]) as a measure of thermal noise (entropy).

1. Calculate energy difference: ![][image2] (where ![][image3] is current energy, ![][image4] is proposed energy).  
2. Calculate ![][image5]: ![][image6]  
3. Calculate Probability ![][image7]: ![][image8]  
* **Low Temperature:** The system strictly obeys the energy gradients. Atoms will only make moves that lower their energy.  
* **High Temperature:** Thermal energy overwhelms the interaction energies. ![][image5] approaches 1, ![][image7] approaches 0.5 (50%), and the system behaves like a random walk, maximizing entropy (mixing) over enthalpy.

### **2.4 Crystal Coordination**

The 2D lattice serves as an analog for 3D crystal structures (like BCC or FCC).

* **4-Coordination:** The atom only interacts with neighbors directly Up, Down, Left, and Right.  
* **8-Coordination:** The atom interacts with Up, Down, Left, Right, PLUS the four Diagonals.  
* **The "Both" State:** When the system is allowed to have both crystal structures, atoms can "flip" between 4 and 8 coordination, effectively moving between two different thermodynamic energy curves.

## **3\. Algorithmic Flow**

At every timestep, the simulation performs *N* attempts (Parallel MC calculations). For each attempt:

### **A. Move Selection**

The algorithm rolls a random number against the Diffusion/Flip slider to determine the move type. *Exception: If the UI is forced to strictly 4-coord or 8-coord, ALL moves are diffusion moves.*

### **B. Diffusion Attempt (Swap)**

1. Select two random sites. If both are filled or both are empty, abort attempt.  
2. If one is filled and one is empty, select the coordination to use (if UI is set to "Both", randomly choose 4 or 8 for this specific calculation).  
3. Calculate ![][image3] (sum of interaction energies of the atom at its current spot).  
4. Calculate ![][image4] (sum of interaction energies if the atom moved to the empty spot).  
5. Apply Glauber probability math.  
6. If accepted: Swap the atom and the empty space. Update the atom's internal label to the coordination used for this calculation, and change its outline color to match.

### **C. Flip Attempt (Coordination Change)**

*(Only allowed if UI is set to "Both")*

1. Select one random filled site. (If its coordination is undetermined, assume it is 4).  
2. Calculate ![][image3] using its *current* coordination state.  
3. Calculate ![][image4] using its *opposite* coordination state (keeping the atom type the same).  
4. Apply Glauber probability math.  
5. If accepted: The atom does not move, but its internal label changes to the new coordination, and its outline color updates.

## **4\. Technical and UI Requirements**

The final application must be a single, self-contained HTML file featuring the following:

* **Responsive Canvas:** A 2D grid that scales to fit the screen, implementing Periodic Boundary Conditions (wrap-around edges).  
* **Manual Override:** Clicking a cell cycles it: A \-\> B \-\> Empty \-\> A, automatically updating the global atom count inputs.  
* **Input Controls:**  
  * Grid dimensions (![][image9] columns, ![][image10] rows).  
  * Initial atom counts (A and B).  
  * Interaction energies (![][image11]) and Temperature (![][image1]).  
  * Timestep (ms) and Parallel MC attempts per timestep.  
  * Diffusion vs. Flip slider (0% to 100%).  
  * Coordination Dropdown (4, 8, Both).  
* **Aesthetics:** Five distinct color pickers (A cell, B cell, Empty cell, 4-coord outline, 8-coord outline).  
* **Execution Controls:** Reset (randomly distributes current A/B counts), Start, and Pause buttons (with strict safety against multiple overlapping timers).  
* **Live Statistics Dashboard:**  
  * Total A count, Total B count, and Overall Filled Fraction.  
  * Coordination Breakdown (calculated over filled cells only):  
    * % of cells with 4-coordination (broken down further into % A and % B).  
    * % of cells with 8-coordination (broken down further into % A and % B).

## **5\. Post-Development Exploration**

Once the application is built, the assignment requires investigating the following phenomena:

1. **Baseline Test:** Set to a single element and 4-coordination to replicate earlier coursework.  
2. **Energy Variations:** Observe system behavior when ![][image12] is altered to be higher or lower than the same-species energies.  
3. **Temperature Extremes:** Observe the transition from strict phase separation (low T) to high-entropy mixing (high T).  
4. **Crystal Segregation:** When "Both" coordination is active, observe which crystal type becomes "A-rich" versus "B-rich". Determine if temperature affects these phase percentages.  
5. **Pure Phases:** Investigate if it is possible to achieve a purely 4-coord or purely 8-coord system even when the "Both" option is selected.

*(Optional Advanced Modifications: Implementing distance-dependent energies, anisotropic directional energies, or vibrational entropy).*

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAt0lEQVR4XmNgGCFAXl5+MxD/JxYja/wvJycXhmQWWAxFERAoKChowMVkZGSEgJzNyAqAgAmq8QKaOAPQgkdgBlByK5BiRJYEmlwA0gik/ZHFtbS02IDifWAO0IR8ZEkQAEq+R3cmCAANElBUVBRHF4cDbP4jBjBDNZ5Bl8ALgE4vh2r0RpfDC4AaPpPjTPL8Bw1u0v0H1DAbpBEY7AnochgAqDAIiL/JQ+LuLRSD/PmLZCePgoECAD3RQx1na4DKAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAAYCAYAAADXufLMAAAD2UlEQVR4Xu2ZS2gUQRCGN4kPfCEoS2Cz2dmNC4GchAg+EUQEiUaioJ58oHj3oBFELwYkGF8Qc1F8X0TQg6IHEdGjCoKKN6Me4k00UXwkMdG/3OqlttIzmSUys9H+oJjuenRXV2/PTCaJhMPhcDj+NzzPG0yn0zO03vGPgg0/CPkFea9tfrB/KNGxEVKtcwmQ4zo4LrLZ7D1LflbRsaGRgzQ1NU3T9gBqOO6lNhDQd00osb8EcrhLeeTz+aS2EWRDodu0Pm6CNra+vj7lZxsXLHYvgjsgh3mSN9rHD/ju45iN2kagyNMx/gutj5qg4hGZTOYRHm3ztD5mzIF6rg2GoDUFIgNFcWqEiy/wHdAT53I5qLwcd+n22i3tccDrGlG6HtF+KEwVgccHCid6g9TTIRU+5W86gnZDukwfA3ZygV5JPz/Yt2RijPFEdKsbGhrmin7koGiLOM8TUi/zxklfLW2VgGc5UOi3INftpo9aL5b2UOhBjc6mt2BuP+9ociSzBu3zIWMjA/ncoZyQXyuuS3Hdgms/rhe1byVh9oFyhqxCvu0Tri0vvniLM0DXzUV6rG0SkwTkCt8hznI/9DsBAf9zkKs2wbiXMc8ltC94hR8U+a7TYwTBOdF6juJ6EnKb+rgDZbRvBWEO1FvO+wykj3TasSyCBjCF0noJ7F+0DzZpK5LcZvp4vq+U9jjgtQxrnewj5xWmXVtbOwv2fmkPgh4fYUXH+oF8DlCOqOdaqYeu17Tr6urm41JFbfjt4HV+wzwLigESGoxOkdYb6NbHg9zXNgPbdfHaZR/2IdmPGqxxCRevU+qh6zNt5LwZ/U2s76FHlV5XEPSiFVZ0rB+e5UA1NzdPha5F+AzSlQ4WfgBpatNfSxRHvsaviB7Qhm1TDZxA4COACh3mpGOcI5BjYQVztuox/MjyR47GxsY52mawrLHKoosUmj8oB/reAPsDanuFR1/Rl2NLPzRBsQxyo0RpAT43eYAxvtAdYpv1+ZpKpWbKROKCc/TNA7Zu/IiuKXWsm04fxzjvp9pm4PymaD1BNqxp/RhluVIyQGGMHzZ9ovACQh966JZ6WhujRBRvVNugo48JvT5riHXTqW40v+1xAFsbr+nPrV2Dzd7j6fcRemPloLIEg52ieLQ/Q0Ygo9qHhWzDkK8lE0cM5h/iXHR+JJT7T8gg5LWOTcS06djQ65yXX21JT7X9Dt+FOj6ZTM72yvjfiaOUWDZ9oiDnZ6atX6gd4zPpNh35DuD078R1F2Q/Nn259nH44BUeCx8hHyCfIB3ap9LAZt+iH6kU7eNwOBwOh2Py8xuvRbJb0aZcCwAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAYCAYAAAD+vg1LAAABJUlEQVR4XmNgGAV0BQoKCrvk5eX/E4PR9RIF8GmWlZWVwiVHCDBDDb6ILgEDZBkM1FQC0gh0mR+yODCYCpDUkGXwR3SNQL6XnJxcHIwPtMQcWZ4oAAtfILYEYkeggWXoFpEDYOF7H2hgG5CeAsRPKDYYaFg5yBCgVz2QxYFid2FsaWlpYSDFiCRnCFR/CsbHCoCKPqO7ztjYmBUo5oWk5ieMDXRIHZA/lRiDQcGA09sqKiqiQPl9yGJAQxvxGqylpcUGNfg0uhwMQC1lQRYjaDBQcgJII3r6hcoFQC2FBwOSXCNWxwAlVgEl/gDxP1hQoGGQ+G8g/g5Ua4BFP8jgs+jiFAOowefQxSkGUIMvoItTBIAGfgXid0D8Bog/MqBF7CigLQAA5Upr84CZrdgAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAYCAYAAAD+vg1LAAABUklEQVR4Xu2Su0rEUBCGV7w1dpLGmBtulUpIISIIdrLI4hOoCPYWXt7AysLC2gewtLTwBQTBBxAb7V0ERRT1G5mjJwOrMYtW+8NwTua/nJNJGo0+/hVpmp4mSfJWpay3Er4zR1E00Y37CYMafGkJh1rBmLbEyM3afp8xbXqaWsEda+S5FcfxinvmkBmfrwQ3X2qWWiBwxx5UB26+1wTusR5SNz0HE7YrIbzqot+nd+X2YRiOswzIHt2qXuSBbzL1abBAcG9vVxTFML2Wp3mSNcuyeQ6ZlH2z2RwVn2idrgQ9vetrExDAn8me9cjXqnf/S63I83xEyXPLOWjQkO0LhGOUS7Yv8zoQ0v6/yi3roR9jsCBwA+6u1MR0TPOFelWzLek/U49op0tmEATBGNyt7fcMQi/cXv55n6sNQju8xRrrOrVN8JzV/BoEntixWU0ff4t3mop0FkJ9tqsAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAZCAYAAADjRwSLAAAAvElEQVR4XmNgGAW0AQoKCpfk5eVfAPE/RUVFNyD9EIgN4QqAnP9ycnJ1yHwQRlbwEUUAIvYMXRFI13MkNTCxb2AO0IoQkADQPelYFNXCFO1At0pGRkYFJKaiosIO0zEFXRGQvwRFTFxcnBtZAMgOhlr1A64IBIBWOkMlQMHgA6KBbmxAUYQMlJSU1ECKgO7iRJeDA6CC9ehuhANgNIgDJYth1gKty0RXAzJBEijhDqSdgO5yAbID0NXQCQAAqak7+OSobo4AAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAAZCAYAAADwvIY6AAAFh0lEQVR4Xu2ae4xcYxjGV7ZxiXtiM+xlzuzssrJIUKGIW9uoCEEQgkREGpc0IiEEFRVFiEYaikiFYrVaiUv7h1QikYbEHxqX9C+NtFXqEtEKpbpbnmfO++1+88w5Z8/MzpnYcX7Jm/N9z/d+t/f7znWmoyMnFQMDA32qOYIgGIGNwnbBVpZKpdXFYvEjpP9B+ib1bwS0cy3a+8TaXI3jGzi+i+NeauofRdIccuoAAb8CwV+quo8t1GW+1t/ff2Fvb++gr00F9LEYNhahb1ctCvg9BXtQ9Zw66OvrOxFB/Ft1xT9LcXW4lEfWnfCYOhwHbInLYwPOMn1kwisZ+O7B+E5QPSclXOjh4eH9VfdBgOf6GyLtJbxe2G65XD6caWyGN7U8JZ1Zja/twULfg+CNqq7A52PYZvg/hIVaX88Zm5ZCoXAwFxK2MAgv/Q0vahBeaZapnjMJDDqfA1RX6IeNcJHLY2OUTd9ix6+jFhDan0nm+6LNx6Dt9epuNX3Y8mu6u7uPwvEX5xMHxnp+1HhyEkDQjkgbtBi/GXwzcJkYn9RwM6C9JyL0ysZx7WMDn4v02mqvWugP39NVz4kBAXspzSLC52L14zNHILca9akX1h8cHDzM17BB3oM+29eQH8FCD/laFGwP9pbqSic6uQ92JzNDQ0OH4pI0U52yxgLKBdmEsSxyOt+jwTl8uoad4YKBMZ6N/MnIn8I0H7yQvwX5Jcg/bj7zGSzUP821l4QF7AfVfYLwXkw/3/bBRtH/CvFtaEOgnaXWpvYzBvvL9+3p6emFdp2vxYF4bEscEwMX2OsV3p2PZWdWoVNcMwV9XsB+MZ4jLb/GDRzjOokPbi4o7hKK9G7TvoUtgF8P/F4wjWVf8BaAM6dg2q9+n1GY3weqNwrbU62Z2El0FtM4LtdyBT7rYseEgutZiKAd6DSkv4ytYMDnGvi8FmOvYlFegb0chGf7cu52bUNhn7DFqqGdO1zeJk/taSv/iQ9UEzVCrK0dvsbLrumJQUvjkxa0sxH2G+xzLWsWNt6KFe07SBLwW0Zf1StYQ1WBM223r2UNJnI1++WVgGezMxvLBvG9wSb/fCnm87DVqzyNR+jRwTDMZ6Hq7UIxfKWujQEKrmIB77m+bgFp6WdO9Pe6jWUexjXXN+inRvhvipyUYXOI2hCVe7LqPlb3ftUdVv6fNx23A2V3R5Yj2O9rAb+/U8Pl9QBfV2yhnqzDqm4Fij0I8gqR6vs/fWkYxzYtI1YetSEq9VT3MZ8XVW8XMLdnImMA8VktCOxM9bVWYQvxXIS+TvK7sHEOwiY62uos8MvNh3rchvhRdR/6oO31qrcLmN9azlH18U+iLo/0lRawqleaVoGz/V5bjJLTkP+QbwlMd3V1HYL8dthOr847NuZ+pxHT+AGm4GmsWxsIwep+r3ozQftfBeHP1xtgm9knNyHm86mlK3POArT/TWwcMIA5LnhIX2KDWaR+rQJjmIkx7PHGVPl1LgivZjuCcFHHP9EivRP2ndn4RrH6W4vhK3WlLdhnrjwJzH8F/VVvJmh/o5fmm9nPXv4Rl84Ci8VK1Wsol8vH0ZmXYy2bbtika24ZacDzU1eWGwIb7vgO7xuPjfV2l8cmXuXSWcD+eLtVvQY4vp1lIFoJ5xH3wJkGqz9H9SxoZcyxEWZN2p+9799lO5W75zb1mS5g/MfAHrC5jJXsU3y9oN7DgfcLY1bwt4dJF6iJBOFX6EdVr4JBRADm4Tibr5NIX64+0wV+tcT4z7Mz4UzOSX3SYgs1Q/VmwttDIB8GM2S/Vm6+tsM2VKZvXFwgbN5bVc8C9PVHYL955DQIFutGvqmo3ixadcbaLfBm1XMagL+vqDZVgvDn89/N+Jq9T32aSbP/9JvzP+Bfwr8lTjk7A78AAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAXCAYAAAAyet74AAAAyklEQVR4XmNgGAVUA4qKiupycnLTFRQUBEB8INsYiDfIysqaIqtjBCq4JC8v7wTE/4H4IRAHgSSA9G+ghgVgVUDOaiDFBBTwBSkE0kowE4AGdIDEYAproPQJuCAUAPlr0MVAgiDTpqOLoSgUFxfnhgpKwsRUVFTYoZrz4QqBnHZ0K4Bij4Bi35DFwL6DmvgBZDrQExuB7FcoiqAKQYpmAZnMQJPClJSU+NHVMIAEQQqVlZVl0eVQAFDRJHT3YQVQa8EY6DZzdPlBAABrVTkENt844wAAAABJRU5ErkJggg==>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAbCAYAAADMIInqAAACMElEQVR4Xu2Yv0scQRTHPQNBrAwIwnJ7u7cnGq6V5A9IJBCiIaTQQvAPEPs0FpbiP2Ch0cSkS+BSiqRJlaCNxMIkXUCsRAUVlSDm8+IszD48VznN7Y1+4cu8XzM7783szLJNTbe4RUMjCIJncBnuwmlMd3SMsygWiw9Jej3WkU9sv/OQhEulki9yPp/vRD/QMU7DXnHk92EYjltu96EKcEIBWmy/8ygUCsMk/kNWv6b3n8Okm8GmqGCb6Mg98JPv+w90bBYRRVEXBTjS9osiR+LfGeCRVBH+hi/FQfuHQrxJhmcLzC8KTq/BCvI97U8FHT/QNNO5XwogA8Y+CjORtrXwv6vCefq/Zbw55Fk4E5ze09kCkxoz7TedLPpHbXMWkihcO8NWlwLEz74u6ufF18igtsEN26aBf/Iy1P0zAW6BJ5KsbUMfEtuNuFtJ9Ksky4HVZ0zNRh9IBNYHMpfEq3nlMCv9i3ZVZLjHN4Cn4/43mMcsi/BY704N/PPadimYpIe0PStIKwBFWtC2C4OVfp72gHojbX7s3kVtiyEfR/TfhivwKfqrRADGHbMDRjgMOxLOjKCGAuTsviKXy+W7doBUqFduAQZ5gZpLODMCXQD01/DA4rHS//0XoP0MZ6x+5xYys0ibeLUdIP3UD5NDHdMQqKEA+7FMzFLYaD9MzHaWA2wTbvG6ftExgmoF8DyvnX5H8KcU0dmPOpKraJtG2i5yFuyCVpIfNTvgvvbfePwFdGLPkqa2/KUAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAYCAYAAAAcYhYyAAAA9klEQVR4XmNgGAWjgEigoKBgAMQzxcXFuUF8dXV1Xnl5+VogLgJyGWHq5OTkyoB4gYyMjDRcMwgYGxuzAhUflpWV9QPS/4G4GaQQqqkeJAaktYD0TaAQM1CdFEhMWlpaBm4IUMFBEA10SQJIEkg3wuSgLgIZ8giuAQiglpUgC9RC6ZsgSbgERCwJXQwImKEGa6OJw00/hiwGcgG6ISCXoovBAdQrHuhiMO8iiwHxW2QxMABqjsBmOtRge3QxoMEuUPZ3ZInL6IbIYwkPoGYbmBiQrgZGtQpcEijwB4gnwwUgYnOA+B2yGFT8LcggIA5ElxsFwxYAAKzPSGpHNMr6AAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAXCAYAAAA/ZK6/AAAAvUlEQVR4XmNgGAWDBsjIyOjKy8vPExcX5wbx1dXVeRUUFBqAeAKQy4SiWEVFhR2oeCsQRwPxfyBulpOTWwCSA9L1IDEUDUCBvVAarAFoaiNMDmQTNg2lUPoauiSQn40uBgcgCaAT2tHFgPgyshgYAJ0hAZIEOQEmBvQbH9SJCiA+kD0VrgHEQbcaWQxIVwNtV0KW/AvEX+ECDGBbC0AaFBUV9YHsS8hyIEkLY2NjVhRBBkj8AOUM0MVHASEAAOsTMHVt+yqZAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAAYCAYAAAA8jknPAAAFS0lEQVR4Xu1Za4hVVRS+o70fRMUwMI977gwTEwNFNJFFUUgFYZSOUIFU9EfoQSVRWVL9UIjCnmoQSUj9iOyPlBQRFkr+6UVYIhWZUhYWmemkk8/b992z9rDud/eZvN2Zubc4Hyz2Wd9ae+/vrLvPPo9bKOTIkSNHjhw5/vcolUrvJ0lSPhbTvs2AahrPtG+TME11jWNPa+dJR5hceaKnp6czK9YkTDe9X2mAAL+0xfRS07vU1N/f364xgjFchHOUn2yEQm7SQEArFRJaHjC9wxojUNwTUcQvlW8mTG9mDYvF4obu7u6zlJ9UhELiyr7B8yjeApeTKXqqAS17VE9vby+opNdcbq/LfbzZsB/+iHAvuuP1LjQ1iBUS/iyswtuCj0Uww8ebCStilV7o+8S50/r6+s5wflOBC+oi0/yM5/05oNZX+diUIBQSdilsJkQ8pIVtIYTb0nYuRmi9BsevtLBe1vcd6oPW61ljtDeh/QPtKs2dSoRCboOQJ9CugO2op5DIvVC5GLiglKsXYVHCXsMP/yTal83/XnNbBaaPPzzr+yxsLX3sSkXNzQLyr1OuIUDMQopAEa/1PLit4birq+tsNG0uXAU7iXG3VsxzOfOUrxcYY0THgfabMf6twcf9/gofR/4yKz4Lvgy5L9kPMV/yuOjJr8KYL+B4pdXmSp9XL2zuQ8p5n/Xxvgdy18G+iPBLoO1btAdMO20b7CPNrUESKeTQ0NDx4Ga5nAM+7gHBb7A/2ss05oGcn3WefwOOoePoToL4Qe8bV9UHT9DnKAe0KcfFoVw9wA9zCftzd/I8uB3hGHPcCH+ujweg30lWu5pzIsDvgi0SjvPd4bkaxArpwfdOxD9U3sDbxN3/NBHiK6zNnOdYYAuSi+xjjQWwwHrFI39Q54Z/f4S7CzbiOYz3NrhRz9WDkn0gGxgYOF1jAarDA7G9GOP2rBzjj1Mu63tBBYODgycwCfapxgJiAwcgtsva0cR+3BhQ+MfZZokn7KqNzhOA/o+a3uj9rrOz85TYHCjcaoz/XvDtCtvjcwhwO5H7sPMfhG13KWPAjnEyxrlPeYXprdEUgNhy7prKE4jN5Ls9NM3IGsPzvN3CP5y43ToKDPg8O+r7u8XmmOjoNo/4BRDVxWPkbIL4DZpDgP8hHJvI6S5cAXLutbmqrjYF4n9lFIA7zxLGeE4aNH4BzxPtbPg/8iqK5cGGLY/nPwJtV2seYbll7C4XayzAXVhHNQaOHx62Mq6xAMQ+YwsNZ8byoPHOJN0RZlMzjhfD1mreGJD4ZpKujKPhBMTIH4KN8gfW/gTzEHsL7RrYL7DfNQeC+8B/bjk0Fup8zSOS9KHksPIE+L2wI6arHDHGqHef9iWYE+P03LLyCpEHW/BzYT9hjFc1RiB20HQFjd54Hqw/H8q+075Ekr6t8GF0jdU5pu1XxB4Rbgtst+cmDJjsKe9jokUZwnaKz/vzLZ7ziI3RKLArnRcblxwWYUfwoesecPt9TiHysOfB+zb6LVR+AtCm48Z0kOOuIhwvwi2emxB0dHScmsjnUPjDKgzCnyvIlcIc2FLPBfD7OmIrlW8UpfTh7APh+Ar0tefg74Y9JtyfsNc955F1tTcKzPlbhCuz9o6q/OvnfH4h5HZfs0AaRpLeY/n6x3fSyo9qt419ZpVv0Wj3mz/27spj68sHwW8C7+JV37EnAkm6nZadcYvdXKz+PMrnA83jFr0R53auy6sCv20gZ53yjYC6knSx8Ra7OvD0k7R2vDXMs2N/2+Mxcxb78f4TaG9vP025VgZ3KOVy5MiRI0eOJuNvDHQJ7cVF8/EAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAYCAYAAACSuF9OAAAB20lEQVR4Xu1UPUsDQRCN+NFYWIgceEkuF2JzIIgpRKzERlL4UdiKjSDYiIiCP0CwE03hT1AbURsRFKytAhYiiIU2FgpBJErU+AZnw9xwEY1Jqnsw7M1783W7y0YiIULUEIlE4sRxnNJvTOfWFT81jcVi3ZW0eqGZB8ppwaChA6HZEjXEToxJHse5IGIaOlBeN4Sficfj08bHcANSryvM/YENwoYxyLIesJEw9+cWg6xhzcLu/zIQYvs1VzUwxAo1x5GMSh7cjfm2bbsTS5OQfaD8ZDLZEcBv8s8e0Td6bZOPdVbHloGAZ70b6XS6FVxGxLxJXQLFd7jJkNYIunY0Gu3RnA/8BxUDUqlUF/QzzTPouOcpHzs8p0UM6ena8Bc1V4bneW080IXWDDi5RfMEaI+8FmBZrWPIXQx1bHx8TyEuL2N8QMIGNdTvD2sTPGzgcUHvw/bb9I2YHJqd6xjKp7eM6mMdh3+HdUbHUbE9iO+wT26qjfgirECNdT6B4qAdYN2HPcCegmKCuEo1qwYKrksfTVZ1c+xer+YIxLmua2m+aliW1Y6iW5KDP6mbY+hDcKeKuwZ3Jbl/AcVene9nohjhd4mP/4Xtg+PoOpSE0RW4xD0b8RUMEaJG+AJgCqaxqSPbwwAAAABJRU5ErkJggg==>