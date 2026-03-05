import { useState, useEffect, useCallback } from 'react';
import { api, Product } from '../services/api';

export function useProducts(initialFilters?: { tag?: string; search?: string; categoryId?: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState(initialFilters || {});

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getProducts(filters);
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    return { products, isLoading, error, filters, setFilters, refetch: fetchProducts };
}

export function useProduct(id: string) {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        api.getProduct(id)
            .then(setProduct)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch product'))
            .finally(() => setIsLoading(false));
    }, [id]);

    return { product, isLoading, error };
}
