import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    Modal,
    Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { DEFAULT_SHOP } from '../constants/shops';

const CATEGORIES = ['All', 'Tablets', 'Syrups', 'Injections', 'First Aid', 'Ointments', 'Other'];

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tablets');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const T = {
    screenBg: dark ? '#0D1117' : '#F8FAFC',
    headerBg: dark ? '#161B22' : '#FFFFFF',
    cardBg: dark ? '#161B22' : '#FFFFFF',
    border: dark ? '#21262D' : '#E2E8F0',
    textPri: dark ? '#F0F6FC' : '#0F172A',
    textSec: dark ? '#8B949E' : '#64748B',
    inputBg: dark ? '#0D1117' : '#F1F5F9',
  };

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = productService.listenToShopProducts(DEFAULT_SHOP.id, (data) => {
      setProducts(data);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const resetForm = () => {
    setName('');
    setCategory('Tablets');
    setPrice('');
    setStock('');
    setDescription('');
    setEditingProduct(null);
  };

  const handleAddEdit = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const productData = {
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      shopId: DEFAULT_SHOP.id,
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save product');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productService.deleteProduct(id);
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setDescription(product.description);
    setModalVisible(true);
  };

  if (!isAdmin) return null;

  return (
    <View style={{ flex: 1, backgroundColor: T.screenBg, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: T.headerBg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: dark ? '#21262D' : '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={22} color={T.textPri} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: T.textPri }}>Inventory</Text>
              <Text style={{ fontSize: 12, color: T.textSec }}>{products.length} Products Total</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => { resetForm(); setModalVisible(true); }}
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 }}>
          <Ionicons name="search" size={18} color={T.textSec} />
          <TextInput 
            placeholder="Search products..." 
            placeholderTextColor={T.textSec}
            style={{ flex: 1, marginLeft: 10, color: T.textPri, fontSize: 14 }}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === cat ? '#6366F1' : (dark ? '#21262D' : '#FFF'),
                borderWidth: 1, borderColor: selectedCategory === cat ? '#6366F1' : T.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedCategory === cat ? '#FFF' : T.textSec }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor="#6366F1" />}
        >
          {filteredProducts.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="cube-outline" size={64} color={T.textSec} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: T.textPri, marginTop: 16 }}>No products found</Text>
              <Text style={{ fontSize: 14, color: T.textSec, marginTop: 8 }}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredProducts.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(idx * 50).springify()}>
                <TouchableOpacity 
                  onLongPress={() => handleDelete(item.id)}
                  onPress={() => openEditModal(item)}
                  style={{
                    backgroundColor: T.cardBg, borderRadius: 20, padding: 16, marginBottom: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 16,
                    borderWidth: 1, borderColor: T.border,
                  }}
                >
                  <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: dark ? '#1E1B4B' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="medical" size={24} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: T.textPri }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{item.category} • Rs. {item.price}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ backgroundColor: item.stock < 10 ? '#FEE2E2' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: item.stock < 10 ? '#EF4444' : '#10B981' }}>{item.stock} in stock</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginTop: 8 }}>
                      <Ionicons name="create-outline" size={20} color={T.textSec} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <Animated.View entering={FadeInUp} style={{ backgroundColor: T.headerBg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: T.textPri }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={T.textSec} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: T.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Product Name</Text>
              <TextInput 
                value={name} onChangeText={setName} placeholder="e.g. Panadol 500mg" 
                placeholderTextColor={T.textSec} style={{ backgroundColor: T.inputBg, borderRadius: 14, padding: 16, color: T.textPri, marginBottom: 16 }} 
              />

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: T.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Price (Rs.)</Text>
                  <TextInput 
                    value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric"
                    placeholderTextColor={T.textSec} style={{ backgroundColor: T.inputBg, borderRadius: 14, padding: 16, color: T.textPri }} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: T.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Stock</Text>
                  <TextInput 
                    value={stock} onChangeText={setStock} placeholder="0" keyboardType="numeric"
                    placeholderTextColor={T.textSec} style={{ backgroundColor: T.inputBg, borderRadius: 14, padding: 16, color: T.textPri }} 
                  />
                </View>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '800', color: T.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {CATEGORIES.slice(1).map((cat) => (
                  <TouchableOpacity 
                    key={cat} onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                      backgroundColor: category === cat ? '#6366F1' : (dark ? '#21262D' : '#F1F5F9'),
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: category === cat ? '#FFF' : T.textSec }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 12, fontWeight: '800', color: T.textSec, marginBottom: 8, textTransform: 'uppercase' }}>Description</Text>
              <TextInput 
                value={description} onChangeText={setDescription} placeholder="Enter product details..." 
                multiline numberOfLines={3} placeholderTextColor={T.textSec} 
                style={{ backgroundColor: T.inputBg, borderRadius: 14, padding: 16, color: T.textPri, minHeight: 100, textAlignVertical: 'top', marginBottom: 24 }} 
              />

              <TouchableOpacity 
                onPress={handleAddEdit}
                style={{ backgroundColor: '#6366F1', borderRadius: 16, padding: 18, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>{editingProduct ? 'Update Product' : 'Add Product'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
