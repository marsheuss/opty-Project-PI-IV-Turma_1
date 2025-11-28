"""
Schemas relacionados ao scraping do Mercado Livre.
"""

from pydantic import BaseModel
from typing import List, Optional

class MercadoLivreProduct(BaseModel):
    """
    Esquema para um produto raspado do Mercado Livre.
    """
    title: str
    price: str
    link: str
    image: Optional[str] = None
    source: str = "Mercado Livre"