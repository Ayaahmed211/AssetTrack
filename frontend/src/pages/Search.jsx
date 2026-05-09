import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearchForm from '../components/search/AdvancedSearchForm';
import SearchResultsTable from '../components/search/SearchResultsTable';
import FindSpareWidget from '../components/search/FindSpareWidget';
import assetService from '../services/assetService';

const INITIAL_FORM = {
  serialNumber: '',
  brand: '',
  model: '',
  status: '',
  type: '',
  assignedUserId: '',
  warrantyStatus: '',
};

const Search = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const activeFilterCount = useMemo(
    () => Object.values(form).filter((v) => String(v).trim() !== '').length,
    [form]
  );

  useEffect(() => {
    let mounted = true;
    const loadDefault = async () => {
      try {
        setLoading(true);
        const data = await assetService.searchAssets();
        if (mounted) {
          setResults(data);
          setError('');
        }
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load searchable assets.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadDefault();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const params = {};
      Object.entries(form).forEach(([key, value]) => {
        if (String(value).trim() !== '') params[key] = value;
      });
      const data = await assetService.searchAssets(params);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = async () => {
    setForm(INITIAL_FORM);
    try {
      setLoading(true);
      setError('');
      const data = await assetService.searchAssets();
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '0.85rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.45rem' }}>Asset Search</h2>
        <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Find hardware across the entire organization.
        </p>
      </div>

      <AdvancedSearchForm
        form={form}
        onChange={handleFieldChange}
        onSubmit={submitSearch}
        onReset={resetSearch}
        loading={loading}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
        <span style={{ color: '#334155', fontSize: '0.85rem' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {error && (
        <div
          style={{
            border: '1px solid rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.08)',
            borderRadius: '10px',
            padding: '0.7rem',
            color: '#b91c1c',
            marginBottom: '0.8rem',
          }}
        >
          {error}
        </div>
      )}

      <SearchResultsTable assets={results} onViewAsset={(id) => navigate(`/assets/${id}`)} />

      <FindSpareWidget />
    </div>
  );
};

export default Search;
