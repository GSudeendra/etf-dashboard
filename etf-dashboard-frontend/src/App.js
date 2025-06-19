import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './App.css';
import Filters from './components/Filters';
import ETFGrid from './components/ETFGrid';
import Header from './layout/Header';
import { fetchMovingAverages, fetchETF, fetchOtherETFs, fetchETFCategories, fetchETFsByStructuredCategory } from './api/etfApi';
import { useETFsByCategory } from './hooks/useETFs';
import { CATEGORIES } from './constants';

function App() {
  const [category, setCategory] = useState('large-cap');
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

  // Fetch structured categories when component mounts
  useEffect(() => {
    fetchETFCategories()
      .then(categories => {
        setStructuredCategories(categories);
      })
      .catch(error => {
        console.error("Failed to fetch ETF categories:", error);
      });
  }, []);

  // Convert structured categories to dropdown options
  const categoryOptions = useMemo(() => {
    // Start with the standard categories
    const standardCategories = [...CATEGORIES];

    // Add structured categories
    const structuredOptions = Object.entries(structuredCategories).map(([key, category]) => ({
      value: `structured-${key}`,
      label: category.label,
      description: category.description,
      isStructured: true
    }));

    // Add "Others" category
    standardCategories.push({ value: 'others', label: 'Others' });

    return [...standardCategories, ...structuredOptions];
  }, [structuredCategories]);

  // Sync groupedEtfs from hook to local state for targeted updates
  useEffect(() => {
    if (groupedEtfs && !groupedLoading) {
      setGroupedEtfsState(groupedEtfs);
    }
  }, [groupedEtfs, groupedLoading]);

  // Handle category change
  const handleCategoryChange = (categoryValue) => {
    // Check if it's a structured category
    if (categoryValue.startsWith('structured-')) {
      const categoryKey = categoryValue.replace('structured-', '');
      setSelectedStructuredCategory(categoryKey);
      setCategory(''); // Clear the standard category

      // Fetch ETFs for this structured category
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

  // Fetch "Others" category ETFs when that category is selected
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

  // Fetch moving averages for a symbol
  const handleFetchMA = useCallback(async (symbol) => {
    return await fetchMovingAverages(symbol);
  }, []);

  // Targeted retry handler for ETFCard
  const handleRetry = async (symbol) => {
    if (!groupedEtfsState) return;
    // Find the category for this symbol
    let foundCategory = null;
    Object.entries(groupedEtfsState).forEach(([cat, etfs]) => {
      if (etfs.some(e => e.symbol === symbol)) foundCategory = cat;
    });
    if (!foundCategory) return;
    // Fetch latest data for this symbol
    const latest = await fetchETF(symbol);
    setGroupedEtfsState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [foundCategory]: prev[foundCategory].map(e => e.symbol === symbol ? latest : e)
      };
    });
  };

  // Determine which ETFs to display based on category
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
          showOtherEtfs={false} // Don't show other ETFs when a specific category is selected
        />
      );
    }
  };

  return (
    <div className="dashboard">
      <Header />
      <Filters
        category={selectedStructuredCategory ? `structured-${selectedStructuredCategory}` : category}
        recommendation={recommendation}
        price={price}
        onCategoryChange={handleCategoryChange}
        onRecommendationChange={setRecommendation}
        onPriceChange={setPrice}
        categories={categoryOptions}
      />
      <div style={{marginBottom: 20, textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <label style={{fontWeight: 500, fontSize: '1rem', cursor: 'pointer'}}>
          <input
            type="checkbox"
            checked={showOnlyWithData}
            onChange={e => setShowOnlyWithData(e.target.checked)}
            style={{marginRight: 8}}
          />
          Show only ETFs with data
        </label>
        {/* Removed "Show Top 5 Liquid ETFs" checkbox */}
      </div>
      {displayContent()}
      <div className="last-updated">
        <p>Last Updated: {/* Optionally add last update time here if available */}</p>
      </div>
    </div>
  );
}

export default App;
