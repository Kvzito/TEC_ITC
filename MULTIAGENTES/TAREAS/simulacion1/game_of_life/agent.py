# FixedAgent: Immobile agents permanently fixed to cells
from mesa.discrete_space import FixedAgent

class Cell(FixedAgent):
    """Represents a single ALIVE or DEAD cell in the simulation."""

    DEAD = 0
    ALIVE = 1

    @property
    def x(self):
        return self.cell.coordinate[0]

    @property
    def y(self):
        return self.cell.coordinate[1]

    @property
    def is_alive(self):
        return self.state == self.ALIVE

    @property
    def neighbors(self):
        return self.cell.neighborhood.agents

    def __init__(self, model, cell, init_state=DEAD):
        """Create a cell, in the given state, at the given x, y position."""
        super().__init__(model)
        self.cell = cell
        self.pos = cell.coordinate
        self.state = init_state
        self._next_state = None
        self.decision = 0
        self.top_left = 0
        self.top_center = 0
        self.top_right = 0

    def determine_state(self):

        # Checamos si los vecinos están justo arriba

        for neighbor in self.neighbors:
            if neighbor.x == self.x - 1 and neighbor.y == self.y + 1:
                self.top_left = neighbor.is_alive
            elif neighbor.x == self.x and neighbor.y == self.y + 1:
                self.top_center = neighbor.is_alive
            elif neighbor.x == self.x + 1 and neighbor.y == self.y + 1:
                self.top_right = neighbor.is_alive

        # A partir del estado de los vecinos de arriba, tomamos una decisión

        if (self.top_left == 1 and self.top_center == 1 and self.top_right == 1) or \
           (self.top_left == 0 and self.top_center == 0 and self.top_right == 0) or \
           (self.top_left == 1 and self.top_center == 0 and self.top_right == 1) or \
           (self.top_left == 0 and self.top_center == 1 and self.top_right == 0):
            next_bit = 0
        elif (self.top_left == 1 and self.top_center == 1 and self.top_right == 0) or \
             (self.top_left == 1 and self.top_center == 0 and self.top_right == 0) or \
             (self.top_left == 0 and self.top_center == 1 and self.top_right == 1) or \
             (self.top_left == 0 and self.top_center == 0 and self.top_right == 1):
            next_bit = 1

       # Evitamos que la fila de hasta arriba cambie de estado

        if self.y == self.model.grid.height - 1:
           self._next_state = self.state
        else:
           self._next_state = self.ALIVE if next_bit == 1 else self.DEAD

    def assume_state(self):
        """Update the cell's state to the state determined in
        the previous step.
        """
        self.state = self._next_state