import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

class EvolutionWhatsAppAPI:
    def __init__(self):
        self.api_url = os.getenv("EVOLUTION_API_URL")
        self.instance = os.getenv("EVOLUTION_INSTANCE")
        self.api_key = os.getenv("EVOLUTION_API_KEY")

    async def enviar_mensagem(self, numero: str, mensagem: str):
        """Envia uma mensagem para um número do WhatsApp usando a Evolution API"""
        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "number": numero,
            "message": mensagem
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.api_url}/message/text/{self.instance}",
                headers=headers,
                json=payload
            ) as response:
                return await response.json()

    async def enviar_confirmacao_pedido(self, numero: str, pedido_id: int, total: float):
        """Envia uma confirmação de pedido via WhatsApp"""
        mensagem = (
            f"🛍️ Pedido #{pedido_id} confirmado!\n\n"
            f"Valor total: R$ {total:.2f}\n\n"
            "Agradecemos sua compra! Em breve você receberá mais informações "
            "sobre o status do seu pedido."
        )
        return await self.enviar_mensagem(numero, mensagem)

    async def enviar_atualizacao_status(self, numero: str, pedido_id: int, status: str):
        """Envia uma atualização de status do pedido"""
        mensagem = (
            f"📦 Atualização do Pedido #{pedido_id}\n\n"
            f"Status atual: {status}\n\n"
            "Para mais informações, acesse nosso sistema."
        )
        return await self.enviar_mensagem(numero, mensagem)
