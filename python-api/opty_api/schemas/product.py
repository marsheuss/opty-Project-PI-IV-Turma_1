from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class Product(BaseModel):
    """
    Schema para um produto retornado da API do Mercado Livre.
    """
    id: str
    title: str
    price: float
    currency_id: str
    permalink: HttpUrl
    thumbnail: HttpUrl
    source: str = "Mercado Livre API"

class SearchResponse(BaseModel):
    """
    Schema de resposta para a busca de produtos.
    """
    products: List[Product]