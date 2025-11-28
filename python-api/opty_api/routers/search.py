"""
Endpoints de busca.
"""

# --- IMPORTS ---
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from opty_api.services.mercadolivre import scrape_mercadolivre
from opty_api.schemas.mercadolivre import MercadoLivreProduct
from typing import List


# --- GLOBAL ---
# Instância do Router
router = APIRouter()


# --- CODE ---
@router.get(
    '/mercadolivre',
    response_model=List[MercadoLivreProduct],
    summary="Scrape de produtos do Mercado Livre",
    description="Busca produtos no Mercado Livre com base em uma query e retorna os resultados.",
)
async def search_mercadolivre_products(
    query: str = Query(..., min_length=3, description="Termo de busca do produto para o Mercado Livre.")
) -> JSONResponse:
    """
    Busca no Mercado Livre por um termo de produto e retorna uma lista de resultados.
    A URL de acesso será: /api/search/mercadolivre?query={seu-termo}
    """
    try:
        products = await scrape_mercadolivre(query)
        
        # Retorna a lista de produtos (pode ser vazia)
        return JSONResponse(content=[p.dict() for p in products], status_code=200)
        
    except Exception as e:
        # Em produção, você deve logar o erro completo
        print(f"Erro na rota /mercadolivre: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao tentar realizar o scraping.")