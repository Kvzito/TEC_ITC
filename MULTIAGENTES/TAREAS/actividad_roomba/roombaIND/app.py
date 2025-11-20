from random_agents.agent import RandomAgent, ObstacleAgent, ChargingStationAgent, TrashAgent
from random_agents.model import RandomModel

from mesa.visualization import (
    Slider,
    SolaraViz,
    make_space_component,
    make_plot_component,
)

from mesa.visualization.components import AgentPortrayalStyle

COLORS = {"trash_count": "#0000FF", "num_trash": "#00FF00", "energy": "#FF0000"}

def random_portrayal(agent):
    if agent is None:
        return

    if isinstance(agent, RandomAgent):
        return AgentPortrayalStyle(
            color="green",
            marker="*",
            size=100
        )
    elif isinstance(agent, ObstacleAgent):
        return AgentPortrayalStyle(
            color="gray",
            marker="s",
            size=100
        )
    elif isinstance(agent, ChargingStationAgent):
        return AgentPortrayalStyle(
            color="blue",
            marker="s",
            size=70
        )
    else:
        # TrashAgent - cuadrado hueco para ver el roomba
        return AgentPortrayalStyle(
            color="none",
            marker="s",
            size=80,
            edgecolors="#8B4513",
            linewidths=3
        )

def post_process(ax):
    ax.set_aspect("equal")

model_params = {
    "seed": {
        "type": "InputText",
        "value": 42,
        "label": "Random Seed",
    },
    "width": Slider("Grid width", 28, 1, 50),
    "height": Slider("Grid height", 28, 1, 50),
    "porObs": Slider("Porcentaje de Obstaculos", 0.2, 0.0, 0.5, 0.05),
    "probTrash": Slider("Probabilidad de Basura", 0.5, 0.0, 1.0, 0.05),
}

# Create the model using the initial parameters from the settings
model = RandomModel(
    width=model_params["width"].value,
    height=model_params["height"].value,
    seed=model_params["seed"]["value"]
)

space_component = make_space_component(
        random_portrayal,
        draw_grid = False,
        post_process=post_process
)

plot_component = make_plot_component(
    {"Basura Recolectada": "blue", "Energia promedio": "red",},
)

plot_component2 = make_plot_component(
    {"Porcentaje Celdas Limpias": "green",},
)

page = SolaraViz(
    model,
    components=[space_component, plot_component, plot_component2],
    model_params=model_params,
    name="Roomba Individual Model",
)
