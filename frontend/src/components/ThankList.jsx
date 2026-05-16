import React, { useCallback, useEffect, useRef, useState } from 'react';
import Thank from './Thank';
import { LoadingSpinner } from './index';
import styles from './styles/ThankList.module.css';

const PAGE_SIZE = 10;

const ThankList = ({ nickname, refreshKey = 0 }) => {
  const [thanks, setThanks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loaderRef = useRef(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(false);
  const requestedPagesRef = useRef(new Set());

  const fetchThanks = useCallback(async (targetPage) => {
    if (isLoading) return;
    if (inFlightRef.current || !hasMore || hasError) return;
    if (requestedPagesRef.current.has(targetPage)) return;

    inFlightRef.current = true;
    requestedPagesRef.current.add(targetPage);
    setIsLoading(true);

    try {
      const nicknameParam = nickname ? `&nickname=${encodeURIComponent(nickname)}` : '';
      const response = await fetch(`/api/thanks?page=${targetPage}&limit=${PAGE_SIZE}${nicknameParam}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch thanks (${response.status})`);
      }

      const data = await response.json();
      const newThanks = data?.thanks || [];

      setThanks((prev) => {
        const seen = new Set(prev.map((item) => item._id));
        const unique = newThanks.filter((item) => !seen.has(item._id));
        return [...prev, ...unique];
      });
      setHasMore(Boolean(data?.pagination?.hasNextPage));
      setPage(targetPage + 1);
    } catch (error) {
      requestedPagesRef.current.delete(targetPage);
      console.error('Error loading thanks:', error);
      setHasError(true);
      setHasMore(false);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [hasError, hasMore, isLoading, nickname]);

  useEffect(() => {
    setThanks([]);
    setPage(1);
    setHasMore(true);
    setHasError(false);
    requestedPagesRef.current = new Set();
    inFlightRef.current = false;
  }, [nickname, refreshKey]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
    }

    if (page !== 1 || inFlightRef.current) return;
    fetchThanks(1);
  }, [page, fetchThanks]);

  useEffect(() => {
    if (!mountedRef.current) return undefined;

    const loaderNode = loaderRef.current;
    if (!loaderNode || hasError) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        if (page === 1 && (inFlightRef.current || isLoading)) return;
        if (hasMore && !inFlightRef.current && !isLoading) {
          fetchThanks(page);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(loaderNode);

    return () => observer.disconnect();
  }, [fetchThanks, hasError, hasMore, isLoading, page]);

  if (hasError && thanks.length === 0) {
    return <p className={styles.emptyState}>No se pudieron cargar los agradecimientos.</p>;
  }

  if (!isLoading && thanks.length === 0) {
    return <p className={styles.emptyState}>No hay agradecimientos para mostrar.</p>;
  }

  return (
    <section className={styles.list}>
      {thanks.map((thank) => (
        <Thank
          key={thank._id}
          fromUser={thank.fromUser}
          toUser={thank.toUser}
          amount={thank.amount}
          reason={thank.reason}
          timestamp={thank.timestamp}
        />
      ))}

      <div ref={loaderRef} className={styles.sentinel} aria-hidden="true" />
      {isLoading && <LoadingSpinner />}
    </section>
  );
};

export default ThankList;
