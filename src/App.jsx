import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import {
  Calculator, Utensils, Settings, LogOut, Trash2,
  Package, Store, Smartphone, Loader2, Lock, Mail
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <Dashboard session={session} />;
}

// ============================================================================
// TELA DE LOGIN E CADASTRO
// ============================================================================
function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { restaurant_name: restaurantName || 'Meu Restaurante' }
          }
        });
        if (error) throw error;
        setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail ou faça login.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao autenticar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">GastroProfit</h1>
            <p className="text-xs text-slate-400">Engenharia de Cardápio & Margem Delivery</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-1">
          {isSignUp ? 'Criar conta do restaurante' : 'Acessar painel financeiro'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isSignUp
            ? 'Configure suas taxas de iFood, 99Food e Keeta em segundos.'
            : 'Entre com seu e-mail e senha para gerenciar seu CMV.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Restaurante</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Ex: Burger House"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@restaurante.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? 'Criar Conta Grátis' : 'Entrar no Sistema')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            {isSignUp ? 'Já tem conta? Faça login' : 'Ainda não tem conta? Cadastre seu restaurante'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SISTEMA PRINCIPAL CONECTADO AO BANCO SUPABASE
// ============================================================================
function Dashboard({ session }) {
  const userId = session.user.id;
  const [activeTab, setActiveTab] = useState('simulator');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    restaurant_name: 'Meu Restaurante',
    monthly_revenue: 50000,
    fixed_costs: 12000,
    tax_rate: 6
  });
  const [channels, setChannels] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedChannelSlug, setSelectedChannelSlug] = useState('ifood');
  const [promoCoupon, setPromoCoupon] = useState(0);
  const [freeShippingCost, setFreeShippingCost] = useState(0);
  const [adsCostPerOrder, setAdsCostPerOrder] = useState(0);

  const [newIng, setNewIng] = useState({ name: '', unit: 'g', package_size: 1000, purchase_price: 0, loss_percentage: 0 });
  const [newProd, setNewProd] = useState({ name: '', category: 'Principais', current_price: 35, target_margin: 18, monthly_sales: 100 });
  const [selectedIngToAdd, setSelectedIngToAdd] = useState('');
  const [qtyToAdd, setQtyToAdd] = useState(100);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [profRes, chanRes, ingRes, prodRes, recRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('delivery_channels').select('*').eq('user_id', userId).order('channel_name'),
        supabase.from('ingredients').select('*').eq('user_id', userId).order('name'),
        supabase.from('products').select('*').eq('user_id', userId).order('name'),
        supabase.from('recipe_items').select('*')
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (chanRes.data) setChannels(chanRes.data);
      if (ingRes.data) setIngredients(ingRes.data);
      if (prodRes.data) {
        setProducts(prodRes.data);
        if (prodRes.data.length > 0 && !selectedProductId) {
          setSelectedProductId(prodRes.data[0].id);
        }
      }
      if (recRes.data) setRecipeItems(recRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const getProductCMV = (productId) => {
    const items = recipeItems.filter((r) => r.product_id === productId);
    return items.reduce((total, item) => {
      const ing = ingredients.find((i) => i.id === item.ingredient_id);
      if (!ing || ing.package_size <= 0) return total;
      const lossFactor = 1 - (Number(ing.loss_percentage) || 0) / 100;
      const realUnitCost = (Number(ing.purchase_price) / Number(ing.package_size)) / (lossFactor > 0 ? lossFactor : 1);
      return total + realUnitCost * Number(item.quantity_used);
    }, 0);
  };

  const fixedCostPercent = useMemo(() => {
    if (!profile.monthly_revenue || profile.monthly_revenue <= 0) return 0;
    return (Number(profile.fixed_costs) / Number(profile.monthly_revenue)) * 100;
  }, [profile]);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const activeChannel = channels.find((c) => c.channel_slug === selectedChannelSlug) || channels[0];

  const simulation = useMemo(() => {
    if (!activeProduct || !activeChannel) return null;

    const cmv = getProductCMV(activeProduct.id);
    const packaging = Number(activeChannel.default_packaging_cost || 0);
    const baseCost = cmv + packaging + Number(promoCoupon) + Number(freeShippingCost) + Number(adsCostPerOrder);

    const variableDeductionsPct =
      Number(activeChannel.commission_rate || 0) +
      Number(activeChannel.payment_fee || 0) +
      Number(profile.tax_rate || 0) +
      fixedCostPercent;

    const currentPrice = Number(activeProduct.current_price || 0);
    const variableCostReais = currentPrice * (variableDeductionsPct / 100) + Number(activeChannel.delivery_fee_fixed || 0);
    const netProfitReais = currentPrice - baseCost - variableCostReais;
    const netMarginPct = currentPrice > 0 ? (netProfitReais / currentPrice) * 100 : 0;

    const targetMargin = Number(activeProduct.target_margin || 15);
    const denominator = 1 - (variableDeductionsPct + targetMargin) / 100;
    const idealPrice = denominator > 0.05 ? (baseCost + Number(activeChannel.delivery_fee_fixed || 0)) / denominator : 0;

    let status = { label: 'Excelente', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (netMarginPct < 5) status = { label: 'Crítico (Prejuízo / Risco)', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    else if (netMarginPct < 12) status = { label: 'Atenção (Margem Apertada)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    else if (netMarginPct < 20) status = { label: 'Saudável', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' };

    return {
      cmv,
      packaging,
      baseCost,
      variableDeductionsPct,
      currentPrice,
      netProfitReais,
      netMarginPct,
      idealPrice,
      status
    };
  }, [activeProduct, activeChannel, ingredients, recipeItems, profile, fixedCostPercent, promoCoupon, freeShippingCost, adsCostPerOrder]);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIng.name || newIng.purchase_price <= 0) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('ingredients')
      .insert([{ ...newIng, user_id: userId }])
      .select()
      .single();
    if (!error && data) {
      setIngredients([...ingredients, data]);
      setNewIng({ name: '', unit: 'g', package_size: 1000, purchase_price: 0, loss_percentage: 0 });
    }
    setSaving(false);
  };

  const handleDeleteIngredient = async (id) => {
    await supabase.from('ingredients').delete().eq('id', id);
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...newProd, user_id: userId }])
      .select()
      .single();
    if (!error && data) {
      setProducts([...products, data]);
      setSelectedProductId(data.id);
      setNewProd({ name: '', category: 'Principais', current_price: 35, target_margin: 18, monthly_sales: 100 });
    }
    setSaving(false);
  };

  const handleAddRecipeItem = async () => {
    if (!activeProduct || !selectedIngToAdd || qtyToAdd <= 0) return;
    const { data, error } = await supabase
      .from('recipe_items')
      .insert([{ product_id: activeProduct.id, ingredient_id: selectedIngToAdd, quantity_used: Number(qtyToAdd) }])
      .select()
      .single();
    if (!error && data) {
      setRecipeItems([...recipeItems, data]);
    }
  };

  const handleRemoveRecipeItem = async (id) => {
    await supabase.from('recipe_items').delete().eq('id', id);
    setRecipeItems(recipeItems.filter((r) => r.id !== id));
  };

  const handleUpdateProductPrice = async (newPrice) => {
    if (!activeProduct) return;
    const rounded = Number(newPrice.toFixed(2));
    await supabase.from('products').update({ current_price: rounded }).eq('id', activeProduct.id);
    setProducts(products.map((p) => (p.id === activeProduct.id ? { ...p, current_price: rounded } : p)));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({
      restaurant_name: profile.restaurant_name,
      monthly_revenue: Number(profile.monthly_revenue),
      fixed_costs: Number(profile.fixed_costs),
      tax_rate: Number(profile.tax_rate)
    }).eq('id', userId);

    for (const ch of channels) {
      await supabase.from('delivery_channels').update({
        commission_rate: Number(ch.commission_rate),
        payment_fee: Number(ch.payment_fee),
        default_packaging_cost: Number(ch.default_packaging_cost)
      }).eq('id', ch.id);
    }
    setSaving(false);
    alert('Configurações e taxas salvas na nuvem!');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm">Sincronizando dados do restaurante...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-white">{profile.restaurant_name}</h1>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                ● Conectado ao Supabase
              </span>
            </div>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800/60">
          {[
            { id: 'simulator', label: 'Simulador Delivery', icon: Smartphone },
            { id: 'products', label: 'Cardápio & Fichas', icon: Utensils },
            { id: 'ingredients', label: 'Despensa (Insumos)', icon: Package },
            { id: 'settings', label: 'Taxas & Custos Fixos', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                  active ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">Nenhum prato cadastrado ainda</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Cadastre seus insumos na Despensa e crie seu primeiro prato para simular as margens nos apps.
                </p>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className="bg-emerald-500 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg"
                >
                  Começar pela Despensa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Selecione o Prato</label>
                      <select
                        value={activeProduct?.id || ''}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — Preço Atual: R$ {Number(p.current_price).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Canal de Venda</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {channels.map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => setSelectedChannelSlug(ch.channel_slug)}
                            className={`p-3 rounded-xl border text-left transition ${
                              selectedChannelSlug === ch.channel_slug
                                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-semibold text-xs">{ch.channel_name}</div>
                            <div className="text-[11px] opacity-75 mt-0.5">Taxa: {ch.commission_rate}%</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Simular Promoções & Custos Extras no Pedido
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Cupom Loja (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={promoCoupon}
                            onChange={(e) => setPromoCoupon(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Frete Grátis Loja (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={freeShippingCost}
                            onChange={(e) => setFreeShippingCost(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Anúncios / Ads (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={adsCostPerOrder}
                            onChange={(e) => setAdsCostPerOrder(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {simulation && (
                  <div className="lg:col-span-5 space-y-4">
                    <div className={`border rounded-2xl p-5 ${simulation.status.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase font-bold tracking-wider opacity-80">Saúde da Operação</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950/60 ${simulation.status.color}`}>
                          {simulation.status.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className={`text-3xl font-extrabold ${simulation.status.color}`}>
                          {simulation.netMarginPct.toFixed(1)}%
                        </span>
                        <span className="text-sm text-slate-300">
                          (Lucro Líquido: <strong>R$ {simulation.netProfitReais.toFixed(2)}</strong> / unid.)
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>CMV (Ingredientes + Perdas):</span>
                        <span className="text-slate-200 font-medium">R$ {simulation.cmv.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Embalagem ({activeChannel.channel_name}):</span>
                        <span className="text-slate-200 font-medium">R$ {simulation.packaging.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Deduções Variáveis ({simulation.variableDeductionsPct.toFixed(1)}%):</span>
                        <span className="text-slate-200 font-medium">
                          R$ {(simulation.currentPrice * (simulation.variableDeductionsPct / 100)).toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Preço Ideal ({activeProduct.target_margin}% lucro):</div>
                          <div className="text-xl font-bold text-emerald-400">R$ {simulation.idealPrice.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => handleUpdateProductPrice(simulation.idealPrice)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition"
                        >
                          Aplicar Preço Ideal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="font-semibold text-base mb-4">Novo Prato no Cardápio</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome do prato (Ex: X-Bacon Artesanal)"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Preço de Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProd.current_price}
                      onChange={(e) => setNewProd({ ...newProd, current_price: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Margem Alvo (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newProd.target_margin}
                      onChange={(e) => setNewProd({ ...newProd, target_margin: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-500 text-slate-950 font-semibold text-sm py-2.5 rounded-lg"
                >
                  + Criar Prato
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold text-base mb-3">Montar Ficha Técnica do Prato</h3>
              {products.length === 0 ? (
                <p className="text-sm text-slate-400">Crie um prato ao lado para vincular ingredientes.</p>
              ) : (
                <div className="space-y-4">
                  <select
                    value={activeProduct?.id || ''}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <select
                      value={selectedIngToAdd}
                      onChange={(e) => setSelectedIngToAdd(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Escolha um insumo...</option>
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={qtyToAdd}
                      onChange={(e) => setQtyToAdd(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleAddRecipeItem}
                      className="bg-emerald-500 text-slate-950 font-semibold px-4 rounded-lg text-sm"
                    >
                      Add
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {recipeItems
                      .filter((r) => r.product_id === activeProduct?.id)
                      .map((item) => {
                        const ing = ingredients.find((i) => i.id === item.ingredient_id);
                        return (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                            <span>
                              {ing?.name} — <strong>{item.quantity_used} {ing?.unit}</strong>
                            </span>
                            <button
                              onClick={() => handleRemoveRecipeItem(item.id)}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <form onSubmit={handleAddIngredient} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Nome do Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carne Moída Blend"
                  value={newIng.name}
                  onChange={(e) => setNewIng({ ...newIng, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Preço Compra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newIng.purchase_price}
                  onChange={(e) => setNewIng({ ...newIng, purchase_price: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Embalagem (g/ml/un)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    required
                    value={newIng.package_size}
                    onChange={(e) => setNewIng({ ...newIng, package_size: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-sm"
                  />
                  <select
                    value={newIng.unit}
                    onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="un">un</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 text-slate-950 font-semibold text-sm py-2 rounded-lg"
              >
                + Salvar Insumo
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Insumo</th>
                    <th className="px-4 py-3">Embalagem</th>
                    <th className="px-4 py-3">Preço Pago</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ingredients.map((ing) => (
                    <tr key={ing.id}>
                      <td className="px-4 py-3 font-medium">{ing.name}</td>
                      <td className="px-4 py-3 text-slate-400">{ing.package_size} {ing.unit}</td>
                      <td className="px-4 py-3 text-emerald-400">R$ {Number(ing.purchase_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteIngredient(ing.id)} className="text-slate-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-base">Estrutura Financeira Global</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome do Restaurante</label>
                  <input
                    type="text"
                    value={profile.restaurant_name}
                    onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Faturamento Médio/Mês (R$)</label>
                  <input
                    type="number"
                    value={profile.monthly_revenue}
                    onChange={(e) => setProfile({ ...profile, monthly_revenue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Custos Fixos/Mês (R$)</label>
                  <input
                    type="number"
                    value={profile.fixed_costs}
                    onChange={(e) => setProfile({ ...profile, fixed_costs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Imposto sobre Venda (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.tax_rate}
                    onChange={(e) => setProfile({ ...profile, tax_rate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-base">Taxas Negociadas por Canal (iFood, 99Food, Keeta)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((ch, idx) => (
                  <div key={ch.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="font-semibold text-sm text-emerald-400">{ch.channel_name}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Comissão (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={ch.commission_rate}
                          onChange={(e) => {
                            const updated = [...channels];
                            updated[idx].commission_rate = e.target.value;
                            setChannels(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Taxa Pgto (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={ch.payment_fee}
                          onChange={(e) => {
                            const updated = [...channels];
                            updated[idx].payment_fee = e.target.value;
                            setChannels(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Embalagem (R$)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={ch.default_packaging_cost}
                          onChange={(e) => {
                            const updated = [...channels];
                            updated[idx].default_packaging_cost = e.target.value;
                            setChannels(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}