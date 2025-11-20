from mesa import Model
from mesa.discrete_space import OrthogonalMooreGrid
from mesa.datacollection import DataCollector
from .agent import RandomAgent, ObstacleAgent, TrashAgent, ChargingStationAgent

#Funciones para recolectar datos
def get_total_trash_collected(model):
    agents = [a for a in model.agents if isinstance(a, RandomAgent)]
    if not agents:
        return 0
    return sum(agent.trash_count for agent in agents)

def get_avg_energy(model):
    agents = [a for a in model.agents if isinstance(a, RandomAgent)]
    if not agents:
        return 0
    return sum(agent.energy for agent in agents) / len(agents)

def get_percentage_clean_cells(model):
    """Calcula el porcentaje de celdas limpias (sin basura)"""
    trash_agents = [a for a in model.agents if isinstance(a, TrashAgent)]
    total_cells = model.width * model.height
    cells_with_trash = len(trash_agents)
    clean_cells = total_cells - cells_with_trash
    return (clean_cells / total_cells) * 100

def get_total_movements(model):
    """Suma todos los movimientos realizados por todos los agentes"""
    agents = [a for a in model.agents if isinstance(a, RandomAgent)]
    if not agents:
        return 0
    return sum(agent.movement_count for agent in agents)

class RandomModel(Model):
    """
    Creates a new model with random agents.
    Args:
        num_agents: Number of agents in the simulation
        height, width: The size of the grid to model
    """
    def __init__(self, num_agents=1, porObs = 0.2, probTrash =0.5, width=8, height=8, seed=42):

        super().__init__(seed=seed)
        self.num_agents = num_agents
        self.seed = seed
        self.width = width
        self.height = height
        self.porObs = porObs
        self.probTrash = probTrash
        self.step_count = 0
        self.max_steps = 200

        self.grid = OrthogonalMooreGrid([width, height], torus=False)

        # Identify the coordinates of the border of the grid
        border = [(x,y)
                  for y in range(height)
                  for x in range(width)
                  if y in [0, height-1] or x in [0, width - 1]]

        # Create the border cells
        for _, cell in enumerate(self.grid):
            if cell.coordinate in border:
                ObstacleAgent(self, cell=cell)

        
        # Create Random Agents with their charging stations
        # Seleccionar celdas aleatorias para cada agente
        if self.num_agents <= len(self.grid.empties.cells):
            agent_cells = self.random.sample(self.grid.empties.cells, self.num_agents)
            
            for cell in agent_cells:
                # Creamos una estación de carga en la misma celda donde nacerá el agente
                station = ChargingStationAgent(self, cell=cell)
                station_pos = cell.coordinate

                # Ahora creamos el robot y le pasamos la posición de SU estación
                RandomAgent(
                    self,
                    cell=cell,
                    energy=100,
                    mapa={},
                    charging_station=station_pos
                )
        
        num_obstacle_cells = int(len(self.grid.empties.cells) * self.porObs)
        obstacle_cells = self.random.sample(self.grid.empties.cells, num_obstacle_cells)
        ObstacleAgent.create_agents(
            self,
            n = num_obstacle_cells,
            cell = obstacle_cells
        )

        


        

        num_trash = int(len(self.grid.empties.cells)*self.probTrash)
        trash_cells = self.random.sample(self.grid.empties.cells, num_trash)
        TrashAgent.create_agents(
            self,
            n = num_trash,
            cell = trash_cells
        )

        # Data Collector
        self.datacollector = DataCollector(
            model_reporters={
                "Basura Recolectada": get_total_trash_collected,
                "Energia promedio": get_avg_energy,
                "Porcentaje Celdas Limpias": get_percentage_clean_cells,
                "Movimientos Totales": get_total_movements
            }
        )

        

        self.running = True

    def step(self):
        '''Advance the model by one step.'''
        self.datacollector.collect(self)
        self.agents.shuffle_do("step")
        
        self.step_count += 1
        
        # Verificar si ya no hay basura
        trash_agents = [a for a in self.agents if isinstance(a, TrashAgent)]
        if len(trash_agents) == 0:
            self.running = False
            return
        
        # Verificar si se alcanzó el límite de pasos
        if self.step_count >= self.max_steps:
            self.running = False