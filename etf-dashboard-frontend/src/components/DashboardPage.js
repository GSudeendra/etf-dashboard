import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from '../layout/Header';
import Filters from './Filters';
import ETFGrid from './ETFGrid';
import { fetchMovingAverages, fetchETF, fetchOtherETFs, fetchETFCategories, fetchETFsByStructuredCategory } from '../api/etfApi';
import { useETFsByCategory } from '../hooks/useETFs';

function DashboardPage() {
  const [category, setCategory] = useState('');
  const [recommendation, setRecommendation] = useState('all');
  const [price, setPrice] = useState('all');
  const [showOnlyWithData, setShowOnlyWithData] = useState(true);
  const [otherETFs, setOtherETFs] = useState([]);
  const [otherETFsLoading, setOtherETFsLoading] = useState(false);
  const [structuredCategories, setStructuredCategories] = useState({});
  const [selectedStructuredCategory, setSelectedStructuredCategory] = useState(null);
  const [structuredCategoryETFs, setStructuredCategoryETFs] = useState([]);
  const [structuredCategoryLoading, setStructuredCategoryLoading] = useState(false);
  const { data: groupedEtfs, loading: groupedLoading, error: groupedError } = useETFsByCategory();
  const [groupedEtfsState, setGroupedEtfsState] = useState(null);

  useEffect(() => {
    fetchETFCategories()
      .then(categories => {
        setStructuredCategories(categories);
        const firstCategory = Object.keys(categories)[0];
        if (firstCategory) {
          setSelectedStructuredCategory(firstCategory);
          setStructuredCategoryLoading(true);
          fetchETFsByStructuredCategory(firstCategory)
            .then(data => {
              setStructuredCategoryETFs(data);
            })
            .catch(error => {
              console.error(`Failed to fetch ETFs for category ${firstCategory}:`, error);
              setStructuredCategoryETFs([]);
            })
            .finally(() => {
              setStructuredCategoryLoading(false);
            });
        }
      })
      .catch(error => {
        console.error("Failed to fetch ETF categories:", error);
      });
  }, []);

  const categoryOptions = useMemo(() => {
    const structuredOptions = Object.entries(structuredCategories).map(([key, category]) => ({
      value: `structured-${key}`,
      label: category.label,
      description: category.description,
      isStructured: true
    }));
    return [...structuredOptions, { value: 'others', label: 'Others' }];
  }, [structuredCategories]);

  useEffect(() => {
    if (groupedEtfs && !groupedLoading) {
      setGroupedEtfsState(groupedEtfs);
    }
  }, [groupedEtfs, groupedLoading]);

  const handleCategoryChange = (categoryValue) => {
    if (categoryValue.startsWith('structured-')) {
      const categoryKey = categoryValue.replace('structured-', '');
      setSelectedStructuredCategory(categoryKey);
      setCategory('');
      setStructuredCategoryLoading(true);
      fetchETFsByStructuredCategory(categoryKey)
        .then(data => {
          setStructuredCategoryETFs(data);
        })
        .catch(error => {
          console.error(`Failed to fetch ETFs for category ${categoryKey}:`, error);
          setStructuredCategoryETFs([]);
        })
        .finally(() => {
          setStructuredCategoryLoading(false);
        });
    } else {
      setCategory(categoryValue);
      setSelectedStructuredCategory(null);
    }
  };

  useEffect(() => {
    if (category === 'others') {
      setOtherETFsLoading(true);
      fetchOtherETFs()
        .then(data => {
          setOtherETFs(data);
        })
        .catch(error => {
          console.error("Failed to fetch other ETFs:", error);
          setOtherETFs([]);
        })
        .finally(() => {
          setOtherETFsLoading(false);
        });
    }
  }, [category]);

  const handleFetchMA = useCallback(async (symbol) => {
    return await fetchMovingAverages(symbol);
  }, []);

  const handleRetry = async (symbol) => {
    if (!groupedEtfsState) return;
    let foundCategory = null;
    Object.entries(groupedEtfsState).forEach(([cat, etfs]) => {
      if (etfs.some(e => e.symbol === symbol)) foundCategory = cat;
    });
    if (!foundCategory) return;
    const latest = await fetchETF(symbol);
    setGroupedEtfsState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [foundCategory]: prev[foundCategory].map(e => e.symbol === symbol ? latest : e)
      };
    });
  };

  const displayContent = () => {
    if (selectedStructuredCategory) {
      if (structuredCategoryLoading) {
        return <div style={{textAlign:'center',padding:40}}>Loading {structuredCategories[selectedStructuredCategory]?.label || 'Category'} ETFs...</div>;
      } else {
        return (
          <ETFGrid
            etfs={structuredCategoryETFs}
            loadingMap={{}}
            onFetchMA={handleFetchMA}
            onRetry={handleRetry}
            recommendation={recommendation}
            price={price}
            showOnlyWithData={showOnlyWithData}
            categoryTitle={structuredCategories[selectedStructuredCategory]?.label}
            categoryDescription={structuredCategories[selectedStructuredCategory]?.description}
          />
        );
      }
    } else if (category === 'others') {
      if (otherETFsLoading) {
        return <div style={{textAlign:'center',padding:40}}>Loading Other ETFs...</div>;
      } else {
        return (
          <ETFGrid
            etfs={otherETFs}
            loadingMap={{}}
            onFetchMA={handleFetchMA}
            onRetry={handleRetry}
            recommendation={recommendation}
            price={price}
            showOnlyWithData={showOnlyWithData}
          />
        );
      }
    } else if (groupedLoading) {
      return <div style={{textAlign:'center',padding:40}}>Loading ETFs...</div>;
    } else if (groupedError) {
      return <div style={{color:'red',textAlign:'center',padding:40}}>{groupedError}</div>;
    } else {
      return (
        <ETFGrid
          grouped={groupedEtfsState || groupedEtfs}
          loadingMap={{}}
          onFetchMA={handleFetchMA}
          onRetry={handleRetry}
          recommendation={recommendation}
          price={price}
          category={category}
          showOnlyWithData={showOnlyWithData}
          showOtherEtfs={false}
        />
      );
    }
  };

  return (
    <div className="dashboard">
      <Header />
      <Filters
        category={selectedStructuredCategory ? `structured-${selectedStructuredCategory}` : category}
        onCategoryChange={handleCategoryChange}
        recommendation={recommendation}
        setRecommendation={setRecommendation}
        price={price}
        setPrice={setPrice}
        showOnlyWithData={showOnlyWithData}
        setShowOnlyWithData={setShowOnlyWithData}
        categoryOptions={categoryOptions}
      />
      {displayContent()}
    </div>
  );
}

export default DashboardPage; 