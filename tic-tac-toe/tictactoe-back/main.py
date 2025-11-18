from flask import Flask, request
from flask_restx import Resource, Api, fields
from flask_cors import CORS
from uuid import uuid4
from datetime import timedelta
from time import time
import random

# ======== CONFIGURACIÓN ========
DISCONNECT_TIMEOUT = timedelta(minutes=5)

# ======== MODELOS EN MEMORIA ========
devices = {}  # {device_id: {"last_active": timestamp, "wins": 0, "losses": 0, "alias": str}}
matches = {}  # {match_id: {"players": {device_id: X/O}, "turn": device_id, "board": [[]], "size": int, "winner": symbol or None}}
waiting_lobby = {}  # {device_id: {"size": int, "timestamp": timestamp}} - jugadores esperando partida

# ======== APP Y API ========
app = Flask(__name__)
CORS(app)
api = Api(
    app,
    title="TicTacToe API",
    version="1.0",
    description="API REST del juego de TicTacToe",
)


# ======== FUNCIONES AUXILIARES ========
def cleanup_inactive_devices():
    """
    Elimina dispositivos inactivos por más de DISCONNECT_TIMEOUT.
    También limpia el lobby de espera.
    """
    now = time()
    inactive = [
        d
        for d, info in devices.items()
        if now - info["last_active"] > DISCONNECT_TIMEOUT.total_seconds()
    ]
    for d in inactive:
        del devices[d]
        # Limpiar del lobby si estaba esperando
        if d in waiting_lobby:
            del waiting_lobby[d]


def update_activity(device_id):
    """Actualiza la última actividad del dispositivo."""
    if device_id in devices:
        devices[device_id]["last_active"] = time()


def check_winner(board, size):
    """
    Verifica si hay ganador en el tablero.
    Para tableros de 5x5 o mayores, se necesitan 4 en línea.
    Para tableros menores, se necesitan 3 en línea.
    """
    n_in_line = 4 if size >= 5 else 3

    def check_line(cells):
        if len(set(cells)) == 1 and cells[0] in ["X", "O"]:
            return cells[0]
        return None

    # Filas y columnas
    for i in range(size):
        for j in range(size - n_in_line + 1):
            row_segment = board[i][j : j + n_in_line]
            winner = check_line(row_segment)
            if winner:
                return winner
            col_segment = [board[j + k][i] for k in range(n_in_line)]
            winner = check_line(col_segment)
            if winner:
                return winner

    # Diagonales
    for i in range(size - n_in_line + 1):
        for j in range(size - n_in_line + 1):
            diag1 = [board[i + k][j + k] for k in range(n_in_line)]
            diag2 = [board[i + k][j + n_in_line - 1 - k] for k in range(n_in_line)]
            for diag in [diag1, diag2]:
                winner = check_line(diag)
                if winner:
                    return winner

    return None


# ======== MODELOS DE DOCUMENTACIÓN ========
register_request = api.model(
    "RegisterRequest",
    {
        "alias": fields.String(
            required=False, description="Alias opcional del dispositivo"
        )
    },
)

register_response = api.model(
    "RegisterResponse",
    {"device_id": fields.String(description="ID único asignado al dispositivo")},
)

device_list_response = api.model(
    "DeviceListResponse",
    {
        "connected_devices": fields.List(
            fields.String, description="IDs de los dispositivos actualmente conectados"
        )
    },
)

match_create_request = api.model(
    "MatchCreateRequest",
    {
        "size": fields.Integer(
            required=False, 
            description="Tamaño del tablero (3-7). Por defecto aleatorio."
        )
    },
)

match_create_response = api.model(
    "MatchCreateResponse",
    {
        "match_id": fields.String(description="ID de la partida creada"),
        "players": fields.Raw(description="Diccionario de jugadores y sus símbolos"),
        "board_size": fields.Integer(description="Tamaño del tablero"),
    },
)

move_request = api.model(
    "MoveRequest",
    {
        "device_id": fields.String(required=True, description="ID del dispositivo"),
        "x": fields.Integer(required=True, description="Coordenada X del movimiento"),
        "y": fields.Integer(required=True, description="Coordenada Y del movimiento"),
    },
)

move_response = api.model(
    "MoveResponse",
    {
        "board": fields.List(
            fields.List(fields.String), description="Estado actualizado del tablero"
        ),
        "next_turn": fields.String(description="ID del siguiente jugador"),
        "winner": fields.String(description="Símbolo del ganador (si existe)"),
    },
)

sync_response = api.model(
    "SyncResponse",
    {
        "board": fields.List(
            fields.List(fields.String), description="Estado actual del tablero"
        ),
        "turn": fields.String(description="ID del jugador cuyo turno es"),
        "winner": fields.String(description="Símbolo del ganador, si hay uno"),
        "size": fields.Integer(description="Tamaño del tablero"),
        "players": fields.Raw(description="Diccionario de jugadores y sus símbolos"),
        "opponent_left": fields.Boolean(description="Indica si el oponente abandonó"),
    },
)

device_match_response = api.model(
    "DeviceMatchResponse",
    {
        "match_id": fields.String(description="ID de la partida activa"),
        "players": fields.Raw(description="Diccionario de jugadores y sus símbolos"),
        "board_size": fields.Integer(description="Tamaño del tablero"),
    },
)

leave_request = api.model(
    "LeaveRequest",
    {
        "device_id": fields.String(required=True, description="ID del dispositivo que abandona")
    },
)

leave_response = api.model(
    "LeaveResponse",
    {
        "message": fields.String(description="Mensaje de confirmación")
    },
)

device_status_response = api.model(
    "DeviceStatusResponse",
    {
        "connected": fields.Boolean(
            description="Indica si el dispositivo está conectado"
        ),
        "wins": fields.Integer(description="Número de victorias"),
        "losses": fields.Integer(description="Número de derrotas"),
        "ratio": fields.Float(description="Ratio de victorias/(victorias+derrotas)"),
    },
)

reset_stats_response = api.model(
    "ResetStatsResponse",
    {
        "message": fields.String(description="Mensaje de confirmación"),
        "wins": fields.Integer(description="Número de victorias (0 después del reset)"),
        "losses": fields.Integer(description="Número de derrotas (0 después del reset)"),
    },
)

surrender_request = api.model(
    "SurrenderRequest",
    {
        "device_id": fields.String(required=True, description="ID del dispositivo que se rinde")
    },
)

surrender_response = api.model(
    "SurrenderResponse",
    {
        "message": fields.String(description="Mensaje de confirmación")
    },
)


# ======== ENDPOINTS ========
@api.route("/devices")
class Devices(Resource):
    @api.expect(register_request)
    @api.marshal_with(register_response, code=201)
    def post(self):
        """Registra un nuevo dispositivo."""
        device_id = str(uuid4())
        data = request.get_json(silent=True) or {}
        alias = data.get("alias", device_id[:8])
        devices[device_id] = {
            "last_active": time(),
            "wins": 0,
            "losses": 0,
            "alias": alias,
        }
        return {"device_id": device_id}, 201

    @api.marshal_with(device_list_response)
    def get(self):
        """Lista los dispositivos conectados."""
        cleanup_inactive_devices()
        return {"connected_devices": list(devices.keys())}


@api.route("/devices/<device_id>/info")
class Device(Resource):
    @api.marshal_with(device_status_response)
    def get(self, device_id):
        """Obtiene el estado de un dispositivo y sus estadísticas globales."""
        cleanup_inactive_devices()
        if device_id not in devices:
            api.abort(404, "Dispositivo no encontrado")

        device = devices[device_id]
        ratio = device["wins"] / max(1, device["wins"] + device["losses"])
        return {
            "connected": True,
            "wins": device["wins"],
            "losses": device["losses"],
            "ratio": ratio,
        }


@api.route("/devices/<device_id>/stats/reset")
class DeviceStatsReset(Resource):
    @api.marshal_with(reset_stats_response)
    def post(self, device_id):
        """Reinicia las estadísticas de victorias y derrotas de un dispositivo."""
        cleanup_inactive_devices()
        if device_id not in devices:
            api.abort(404, "Dispositivo no encontrado")
        
        devices[device_id]["wins"] = 0
        devices[device_id]["losses"] = 0
        update_activity(device_id)
        
        return {
            "message": "Estadísticas reiniciadas correctamente",
            "wins": 0,
            "losses": 0,
        }


@api.route("/devices/<device_id>/match")
class DeviceMatch(Resource):
    @api.marshal_with(device_match_response)
    def get(self, device_id):
        """
        Busca si existe una partida activa para este dispositivo.
        Útil para reconectar a una partida en curso.
        """
        cleanup_inactive_devices()
        
        if device_id not in devices:
            api.abort(404, "Dispositivo no encontrado")
        
        # Buscar partida activa para este dispositivo
        for match_id, match in matches.items():
            if device_id in match["players"] and not match["winner"]:
                return {
                    "match_id": match_id,
                    "players": match["players"],
                    "board_size": match["size"],
                }
        
        api.abort(404, "No hay partida activa para este dispositivo")


@api.route("/matches")
class CreateMatch(Resource):
    @api.expect(match_create_request)
    @api.marshal_with(match_create_response, code=201)
    def post(self):
        """
        Crea una nueva partida o une a un jugador al lobby de espera.
        Si hay otro jugador esperando con el mismo tamaño de tablero, los empareja.
        Si no, el jugador entra en el lobby de espera.
        """
        cleanup_inactive_devices()
        
        data = request.get_json(silent=True) or {}
        size = data.get("size")
        device_id = data.get("device_id")
        
        if not device_id:
            api.abort(400, "Se requiere device_id")
        
        if device_id not in devices:
            api.abort(404, "Dispositivo no encontrado")
        
        # Verificar si este dispositivo ya está en una partida activa
        for match_id, match in matches.items():
            if device_id in match["players"] and not match["winner"]:
                # Ya está en una partida, retornarla
                return {
                    "match_id": match_id,
                    "players": match["players"],
                    "board_size": match["size"]
                }, 201
        
        if size is None:
            size = random.randint(3, 7)
        else:
            size = max(3, min(7, int(size)))
        
        # Buscar si hay alguien esperando con el mismo tamaño de tablero
        opponent_id = None
        for waiting_id, waiting_info in list(waiting_lobby.items()):
            if waiting_info["size"] == size and waiting_id != device_id:
                opponent_id = waiting_id
                break
        
        if opponent_id:
            # ¡Emparejamiento encontrado! Crear partida
            del waiting_lobby[opponent_id]
            # Remover al dispositivo actual del lobby si estaba
            if device_id in waiting_lobby:
                del waiting_lobby[device_id]
            
            # Asignar símbolos aleatoriamente
            players_list = [device_id, opponent_id]
            random.shuffle(players_list)
            
            board = [["" for _ in range(size)] for _ in range(size)]
            match_id = str(uuid4())
            
            players = {players_list[0]: "X", players_list[1]: "O"}
            turn = next(pid for pid, sym in players.items() if sym == "X")
            
            matches[match_id] = {
                "players": players,
                "turn": turn,
                "board": board,
                "size": size,
                "winner": None,
            }
            
            update_activity(device_id)
            update_activity(opponent_id)
            
            return {"match_id": match_id, "players": players, "board_size": size}, 201
        else:
            # No hay oponente, entrar en el lobby de espera
            waiting_lobby[device_id] = {
                "size": size,
                "timestamp": time()
            }
            update_activity(device_id)
            api.abort(202, f"Esperando oponente para tablero {size}x{size}")


@api.route("/matches/<match_id>/moves")
class MatchMove(Resource):
    @api.expect(move_request)
    @api.marshal_with(move_response)
    def post(self, match_id):
        """Realiza un movimiento en la partida."""
        data = request.get_json()
        device_id, x, y = data["device_id"], data["x"], data["y"]

        if match_id not in matches:
            api.abort(404, "Partida no encontrada")

        match = matches[match_id]
        if match["winner"]:
            api.abort(400, "La partida ya ha terminado")
        if device_id != match["turn"]:
            api.abort(403, "No es tu turno")
        if not (0 <= x < match["size"] and 0 <= y < match["size"]):
            api.abort(400, "Movimiento fuera del tablero")
        if match["board"][x][y] != "":
            api.abort(400, "Casilla ocupada")

        symbol = match["players"][device_id]
        match["board"][x][y] = symbol

        winner = check_winner(match["board"], match["size"])
        if winner:
            match["winner"] = winner
            for pid, sym in match["players"].items():
                if sym == winner:
                    devices[pid]["wins"] += 1
                else:
                    devices[pid]["losses"] += 1
            return {"board": match["board"], "next_turn": None, "winner": winner}

        next_turn = next(pid for pid in match["players"] if pid != device_id)
        match["turn"] = next_turn
        update_activity(device_id)

        return {"board": match["board"], "next_turn": next_turn, "winner": None}


@api.route("/matches/<match_id>")
class MatchState(Resource):
    @api.marshal_with(sync_response)
    def get(self, match_id):
        """Devuelve el estado actual de la partida."""
        if match_id not in matches:
            api.abort(404, "Partida no encontrada")
        m = matches[match_id]
        return {
            "board": m["board"],
            "turn": m["turn"],
            "winner": m["winner"],
            "size": m["size"],
            "players": m["players"],
            "opponent_left": False,
        }


@api.route("/matches/<match_id>/leave")
class MatchLeave(Resource):
    @api.expect(leave_request)
    @api.marshal_with(leave_response)
    def post(self, match_id):
        """
        Un jugador abandona la partida.
        El oponente gana automáticamente y se actualiza la puntuación.
        La partida se elimina del servidor.
        """
        if match_id not in matches:
            api.abort(404, "Partida no encontrada")
        
        data = request.get_json()
        device_id = data["device_id"]
        
        match = matches[match_id]
        
        if device_id not in match["players"]:
            api.abort(403, "No eres parte de esta partida")
        
        if match["winner"]:
            # La partida ya terminó, solo eliminarla
            del matches[match_id]
            return {"message": "Partida finalizada"}
        
        # El que abandona pierde, el otro gana
        opponent_id = next(pid for pid in match["players"] if pid != device_id)
        opponent_symbol = match["players"][opponent_id]
        
        match["winner"] = opponent_symbol
        devices[opponent_id]["wins"] += 1
        devices[device_id]["losses"] += 1
        
        # Eliminar la partida
        del matches[match_id]
        
        return {"message": f"Has abandonado. {opponent_symbol} gana la partida."}


@api.route("/matches/<match_id>/surrender")
class MatchSurrender(Resource):
    @api.expect(surrender_request)
    @api.marshal_with(surrender_response)
    def post(self, match_id):
        """
        El jugador se rinde y otorga la victoria al oponente.
        Actualiza las estadísticas correspondientes.
        """
        if match_id not in matches:
            api.abort(404, "Partida no encontrada")
        
        data = request.get_json()
        device_id = data["device_id"]
        
        match = matches[match_id]
        
        if device_id not in match["players"]:
            api.abort(403, "No eres parte de esta partida")
        
        if match["winner"]:
            api.abort(400, "La partida ya ha terminado")
        
        # El que se rinde pierde, el otro gana
        surrendering_symbol = match["players"][device_id]
        opponent_id = next(pid for pid in match["players"] if pid != device_id)
        opponent_symbol = match["players"][opponent_id]
        
        match["winner"] = opponent_symbol
        devices[opponent_id]["wins"] += 1
        devices[device_id]["losses"] += 1
        
        return {"message": f"Te has rendido. {opponent_symbol} gana la partida."}


if __name__ == "__main__":
    app.run(debug=True)