"""
Endpoints de busca.
"""

# --- IMPORTS ---
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from opty_api.services.mercadolivre import scrape_mercadolivre
from opty_api.schemas.mercadolivre import MercadoLivreProduct
from opty_api.app import container
from opty_api.utils.prompts import get_query_prompt
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

    # Get OpenAI client
    openai_client = container['openai_client']

    # Normalize the query using OpenAI
    final_query = await openai_client.chat.completions.create(
        model='gpt-4.1-mini-2025-04-14',
        temperature=0.2,
        messages=get_query_prompt(query)
    )

    # Log the normalized query
    print(f'[DEBUG   ] Final normalized query: {final_query.choices[0].message.content}')

    # Scrape Mercado Livre with the normalized query
    try:
        products = await scrape_mercadolivre(final_query.choices[0].message.content)
        
        # Retorna a lista de produtos (pode ser vazia)
        return JSONResponse(content=[p.model_dump() for p in products], status_code=200)

    # Errors occurring during scraping: raise HTTP 500
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao tentar realizar o scraping.")
