from mesa.discrete_space import CellAgent, FixedAgent
from collections import deque

class TrashAgent(FixedAgent):
    def __init__ (self, model, cell):
        super().__init__(model)
        self.cell = cell

class ChargingStationAgent(FixedAgent):
    def __init__ (self, model, cell):
        super().__init__(model)
        self.cell = cell
    def step(self):
        pass

class ObstacleAgent(FixedAgent):
    def __init__(self, model, cell):
        super().__init__(model)
        self.cell=cell
    def step(self):
        pass

class RandomAgent(CellAgent):
    def __init__(self, model, cell, energy = 100, mapa = None, charging_station = (0,0), trash_count=0):
        super().__init__(model)
        self.cell = cell
        self.energy = energy
        self.mapa = mapa if mapa is not None else {}

        self.known_stations = {charging_station}

        # Estados de comportamiento
        self.returnning_to_station = False
        self.path_to_station = None
        self.state_charging = False

        #Estado para exploracion proactiva
        self.exploration_target = None
        self.path_to_target = None

        self.trash_count = trash_count
        self.movement_count = 0

        # Marcamos la celda inicial como visitada (2)
        self.mapa[self.cell.coordinate] = 2

    @property
    def neighbors(self):
        return self.cell.neighborhood.agents

    def get_cell_from_coords(self, x, y):
        for cell in self.model.grid.all_cells:
            if cell.coordinate == (x,y):
                return cell
        return None

    def scan_environment(self):
        """Actualiza el mapa con la información local"""
        cells_around_me = self.cell.neighborhood
        current_pos = self.cell.coordinate

        # Marco donde estoy como visitado (2)
        self.mapa[current_pos] = 2

        for neigh_cell in cells_around_me:
            nx, ny = neigh_cell.coordinate

            # Si no la conozco, la marco como frontera (-1) inicialmente
            if (nx, ny) not in self.mapa:
                self.mapa[(nx, ny)] = -1

            # Detectar contenido
            has_obstacle = False
            for agent in neigh_cell.agents:
                if isinstance(agent, ChargingStationAgent):
                    self.known_stations.add(neigh_cell.coordinate)
                    self.mapa[(nx, ny)] = 0 # Estaciones son transitables
                elif isinstance(agent, ObstacleAgent):
                    self.mapa[(nx, ny)] = 1
                    has_obstacle = True

            # Si ya sabía que era -1 y veo que no hay obstaculo, confirmo que es accesible
            # Pero no la marco como 2 (visitada) hasta que la pise.
            if not has_obstacle and self.mapa[(nx, ny)] == 1:
                 # Correccion de mapa: creiamos que era obstáculo pero no lo es (casos dinámicos)
                 self.mapa[(nx, ny)] = 0

    def move(self):
        if self.energy <= 0:
            return

        # 1. Escanear entorno
        self.scan_environment()

        # 2. Gestion de carga
        if self.state_charging:
            if self.energy >= 100:
                self.state_charging = False
                self.returnning_to_station = False
            else:
                self.energy = min(100, self.energy + 5)
                return

        # 3. Verificar bateria critica -> Ir a cargar
        # Umbral dinamico: un poco más alto para dar margen al pathfinding
        if self.energy < 40 and not self.state_charging:
            self.go_to_station()
            return

        # 4. Comportamiento de Limpieza (Prioridad Alta)
        # Si hay basura adyacente, ir por ella.
        cells_with_trash = self.cell.neighborhood.select(
            lambda cell: any(isinstance(obj, TrashAgent) for obj in cell.agents) and
                         not any(isinstance(obj, RandomAgent) for obj in cell.agents) # evitar agentes en la celda
        )

        if cells_with_trash:
            next_cell = cells_with_trash.select_random_cell()
            self.execute_move(next_cell)
            self.path_to_target = None
            return

        # 5. Comportamiento de Exploracion Inteligente
        # Intentar moverse a una celda adyacente que sea frontera (-1)
        unexplored_neighbors = self.cell.neighborhood.select(
            lambda cell: self.mapa.get(cell.coordinate, -1) == -1 and
                         not any(isinstance(a, ObstacleAgent) for a in cell.agents) and
                         not any(isinstance(obj, RandomAgent) for obj in cell.agents) # evitar agentes en la celda
        )

        if unexplored_neighbors:
            next_cell = unexplored_neighbors.select_random_cell()
            self.execute_move(next_cell)
            self.path_to_target = None
            return

        # 6. Exploración Proactiva (Targeting Global)
        # Si no hay nada interesante cerca, buscar en el mapa global una celda -1
        self.proactive_exploration()

    def proactive_exploration(self):
        """
        Calcula una ruta hacia la celda inexplorada (-1) más cercana en el mapa conocido.
        """
        current_pos = self.cell.coordinate

        # Si ya tengo una ruta y sigue siendo valida, la sigo
        if self.path_to_target and len(self.path_to_target) > 0:
            next_pos = self.path_to_target[0]
            # Verificar si el siguiente paso es valido (no obstaculo repentino)
            if self.mapa.get(next_pos) != 1:
                next_cell = self.get_cell_from_coords(*next_pos)
                if next_cell:
                    self.execute_move(next_cell)
                    self.path_to_target.pop(0)
                    return
            else:
                # Ruta bloqueada, recalcular
                self.path_to_target = None

        # Buscar todas las celdas marcadas como -1 en mi mapa
        frontier_cells = [pos for pos, val in self.mapa.items() if val == -1]

        if not frontier_cells:
            # Mapa completamente explorado (o inaccesible): Movimiento Aleatorio
            # pero evitando obstáculos
            valid_neighbors = self.cell.neighborhood.select(
                 lambda cell: not any(isinstance(a, ObstacleAgent) for a in cell.agents)
            )
            if valid_neighbors:
                self.execute_move(valid_neighbors.select_random_cell())
            return

        # Encontrar la mas cercana (Distancia Manhattan simple)
        # Esto es una heuristica rapida antes de hacer el BFS pesado
        closest_frontier = min(
            frontier_cells,
            key=lambda pos: abs(pos[0] - current_pos[0]) + abs(pos[1] - current_pos[1])
        )

        # Calcular ruta BFS hacia esa frontera
        path = self.bfs(current_pos, closest_frontier)

        if path and len(path) > 1:
            self.path_to_target = path[1:] # Quitamos la posicion actual
            next_pos = self.path_to_target[0]
            next_cell = self.get_cell_from_coords(*next_pos)
            if next_cell:
                self.execute_move(next_cell)
                self.path_to_target.pop(0)
        else:
            # Si no encuentra ruta (ej. isla inalcanzable), marcar esa celda como visitada
            # para no volver a intentarlo y moverse random
            self.mapa[closest_frontier] = 2
            valid_neighbors = self.cell.neighborhood.select(
                 lambda cell: not any(isinstance(a, ObstacleAgent) for a in cell.agents)
            )
            if valid_neighbors:
                self.execute_move(valid_neighbors.select_random_cell())

    def go_to_station(self):
        current_pos = self.cell.coordinate
        # 1. Seleccionar estación mas cercana
        closest_station = min(
            self.known_stations,
            key=lambda pos: abs(pos[0] - current_pos[0]) + abs(pos[1] - current_pos[1])
        )
        # 2. Si ya estoy en la estación: CARGAR
        if current_pos == closest_station:
            self.state_charging = True
            return
        # 3. Calcular ruta
        path = self.bfs(current_pos, closest_station)

        if path and len(path) > 1:
            next_pos = path[1]
            next_cell = self.get_cell_from_coords(*next_pos)

            # Verificar si hay otro robot en la siguiente celda (sea la estacion o el camino)
            has_robot = any(isinstance(agent, RandomAgent) for agent in next_cell.agents)

            # Solo nos movemos si la celda existe Y NO hay otro robot
            if next_cell and not has_robot:
                self.execute_move(next_cell)

                # Si al moverme cai en la estacion, activar estado de carga
                if next_pos in self.known_stations:
                    self.state_charging = True
            else:
                # Si esta ocupada, el agente "espera" este turno (pass)
                # Esto hace una fila de espera natural
                pass

    def execute_move(self, next_cell):
        """Función auxiliar para ejecutar el movimiento físico y gasto de energía"""
        self.cell = next_cell
        self.movement_count += 1
        self.energy -= 1

        # IMPORTANTE: Al pisar la celda, la marcamos como Visitada (2)
        # Esto permite que el BFS la use para backtracking después
        self.mapa[self.cell.coordinate] = 2

    def clean(self):
        trash_in_cell = [agent for agent in self.cell.agents if isinstance(agent, TrashAgent)]

        if trash_in_cell:
            # Limpiar
            trash_in_cell[0].remove()
            self.energy -= 1
            self.trash_count += 1
            return

    def step(self):
        # Prioridad 1: Limpiar si hay basura en la celda actual
        trash_in_cell = [agent for agent in self.cell.agents if isinstance(agent, TrashAgent)]

        if trash_in_cell:
            # Solo limpiar (no moverse)
            self.clean()
        else:
            # Si no hay basura aquí, moverse
            self.move()


    def bfs(self, start, goal):
        """
        BFS que considera transitables:
        0: Libre escaneado
        2: Visitado (para poder regresar)
        -1: Frontera (destino válido)
        Estaciones: Transitables
        """
        queue = deque([(start, [start])])
        visited = {start}
        directions = [(0,1), (0,-1), (-1,0), (1,0)]

        while queue:
            current_pos, path = queue.popleft()

            if current_pos == goal:
                return path

            x,y = current_pos
            for dx, dy in directions:
                next_pos = (x+dx, y+dy)

                if next_pos in visited:
                    continue

                # Verificar límites
                if not (0 <= next_pos[0] < self.model.width and 0 <= next_pos[1] < self.model.height):
                    continue

                # Lógica de Mapa para BFS
                # Default -1 si no está en el mapa (asumimos explorable)
                cell_state = self.mapa.get(next_pos, -1)

                # REGLA: Solo caminamos por celdas Libres (0), Visitadas (2), o la meta (-1)
                # Obstáculos (1) están prohibidos.
                if cell_state == 1:
                    continue

                visited.add(next_pos)
                queue.append((next_pos, path + [next_pos]))

        return None
