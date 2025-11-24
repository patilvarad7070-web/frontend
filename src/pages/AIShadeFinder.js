import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Wand2, Upload, Save, Sparkles, Droplet, Camera, X, Palette } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = "https://api.aura-beauty-boutique.com";
const API = `${BACKEND_URL}/api`;

const AIShadeFinder = () => {
  const navigate = useNavigate();   
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [shadeName, setShadeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const token = localStorage.getItem('aura_token');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('palettes'); // 'palettes' or 'colors'

  const allPalettes = [
    // ========== NUDES ==========
    { name: 'Classic Nudes', colors: ['#F5E6D3', '#E8D4C0', '#D4A5A5', '#C89595'], category: 'nudes', finish: 'matte' },
    { name: 'Warm Nudes', colors: ['#F0C5A8', '#E5B299', '#D4A088', '#C38E70'], category: 'nudes', finish: 'satin' },
    { name: 'Cool Nudes', colors: ['#E5D4D1', '#D1B8B3', '#BFA5A0', '#AC9290'], category: 'nudes', finish: 'cream' },
    { name: 'Deep Nudes', colors: ['#B08D88', '#9A7D7A', '#8B6F6C', '#7A5E5A'], category: 'nudes', finish: 'matte' },
    
    // ========== BROWNS ==========
    { name: 'Chocolate Truffle', colors: ['#8B4513', '#A0522D', '#8B7355', '#6B4423'], category: 'browns', finish: 'matte' },
    { name: 'Caramel Dream', colors: ['#D2691E', '#C68E5E', '#B87333', '#A0693E'], category: 'browns', finish: 'glossy' },
    { name: 'Mocha Latte', colors: ['#A67B5B', '#936B53', '#7F5C4D', '#6B4E40'], category: 'browns', finish: 'satin' },
    { name: 'Cinnamon Spice', colors: ['#B5651D', '#A0522D', '#8B4513', '#7B3F00'], category: 'browns', finish: 'cream' },
    
    // ========== PINKS ==========
    { name: 'Baby Pink', colors: ['#FFD1DC', '#FFC0CB', '#FFB6C1', '#FFA8C5'], category: 'pinks', finish: 'cream' },
    { name: 'Hot Pink', colors: ['#FF69B4', '#FF1493', '#DB7093', '#C71585'], category: 'pinks', finish: 'glossy' },
    { name: 'Rose Garden', colors: ['#FF66B2', '#FF4D94', '#E63E7A', '#CC3366'], category: 'pinks', finish: 'satin' },
    { name: 'Dusty Pink', colors: ['#DCAE96', '#D4A5A5', '#C9ADA7', '#B8A0A0'], category: 'pinks', finish: 'matte' },
    { name: 'Fuchsia Nights', colors: ['#FF00FF', '#E900D7', '#D700B3', '#C20090'], category: 'pinks', finish: 'glossy' },
    
    // ========== REDS ==========
    { name: 'Classic Red', colors: ['#DC143C', '#B22222', '#8B0000', '#800000'], category: 'reds', finish: 'matte' },
    { name: 'Cherry Red', colors: ['#DE3163', '#C41E3A', '#B31B1B', '#A01010'], category: 'reds', finish: 'glossy' },
    { name: 'Wine Red', colors: ['#722F37', '#800020', '#5D001E', '#4A0E15'], category: 'reds', finish: 'matte' },
    { name: 'Orange Red', colors: ['#FF4500', '#FF2400', '#E32636', '#C91F37'], category: 'reds', finish: 'satin' },
    { name: 'Brick Red', colors: ['#CB4154', '#B03A2E', '#922B21', '#7B241C'], category: 'reds', finish: 'matte' },
    
    // ========== CORALS ==========
    { name: 'Coral Reef', colors: ['#FF7F50', '#FF6F61', '#FFA07A', '#FFB6A3'], category: 'corals', finish: 'glossy' },
    { name: 'Peach Coral', colors: ['#FFCBA4', '#FFB88C', '#FFA07A', '#FF8C69'], category: 'corals', finish: 'cream' },
    { name: 'Sunset Coral', colors: ['#FF7F50', '#FF6347', '#FF5733', '#E84C3D'], category: 'corals', finish: 'satin' },
    { name: 'Living Coral', colors: ['#FF6F61', '#FF8066', '#FF9478', '#FFA88A'], category: 'corals', finish: 'glossy' },
    
    // ========== MULTICOLOR ==========
    { name: 'Rainbow Bright', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00'], category: 'multicolor', finish: 'glossy' },
    { name: 'Sunset Sky', colors: ['#FF6B35', '#F7931E', '#FDC830', '#F37335'], category: 'multicolor', finish: 'satin' },
    { name: 'Ocean Waves', colors: ['#00B4D8', '#0096C7', '#0077B6', '#023E8A'], category: 'multicolor', finish: 'glossy' },
    { name: 'Purple Haze', colors: ['#9B59B6', '#8E44AD', '#7D3C98', '#6C3483'], category: 'multicolor', finish: 'satin' },
    
    // ========== PRIMARY COLORS ==========
    { name: 'Primary Basics', colors: ['#FF0000', '#0000FF', '#FFFF00', '#000000'], category: 'primary', finish: 'matte' },
    { name: 'Bold Primaries', colors: ['#E74C3C', '#3498DB', '#F1C40F', '#34495E'], category: 'primary', finish: 'glossy' },
    
    // ========== FOOD INSPIRED ==========
    { name: 'Strawberry Shake', colors: ['#FF6B6B', '#FF5252', '#FF4040', '#E63939'], category: 'food', finish: 'glossy' },
    { name: 'Chocolate Mousse', colors: ['#5D4037', '#4E342E', '#3E2723', '#2E1A1A'], category: 'food', finish: 'matte' },
    { name: 'Raspberry Tart', colors: ['#E30B5C', '#C70039', '#900C3F', '#581845'], category: 'food', finish: 'glossy' },
    { name: 'Caramel Macchiato', colors: ['#D2691E', '#CD853F', '#B8860B', '#A0826D'], category: 'food', finish: 'cream' },
    { name: 'Plum Pudding', colors: ['#8E4585', '#7B3A70', '#6B315B', '#5A2847'], category: 'food', finish: 'satin' },
    { name: 'Cherry Pie', colors: ['#B91646', '#A01239', '#870E2D', '#6E0A21'], category: 'food', finish: 'glossy' },
    
    // ========== DRINK INSPIRED ==========
    { name: 'Red Wine', colors: ['#722F37', '#641E28', '#56161E', '#480E15'], category: 'drink', finish: 'matte' },
    { name: 'Rose Champagne', colors: ['#F88379', '#F06C61', '#E85449', '#DF3B30'], category: 'drink', finish: 'glossy' },
    { name: 'Espresso Shot', colors: ['#3E2723', '#2E1A1A', '#1E1010', '#0E0808'], category: 'drink', finish: 'matte' },
    { name: 'Sangria Splash', colors: ['#8B1A1A', '#A52A2A', '#B8312F', '#C03728'], category: 'drink', finish: 'glossy' },
    
    // ========== MINERALS ==========
    { name: 'Ruby Stone', colors: ['#E0115F', '#C70039', '#9B1B30', '#780028'], category: 'minerals', finish: 'glossy' },
    { name: 'Rose Quartz', colors: ['#F8C8DC', '#F4B5C8', '#F0A2B4', '#EC8FA0'], category: 'minerals', finish: 'satin' },
    { name: 'Garnet Gem', colors: ['#7E2811', '#6E1F0F', '#5E160D', '#4E0D0B'], category: 'minerals', finish: 'matte' },
    { name: 'Coral Stone', colors: ['#FF7F50', '#FF6347', '#FF4500', '#FF3300'], category: 'minerals', finish: 'glossy' },
    
    // ========== ROMANCE ==========
    { name: 'First Kiss', colors: ['#FFB6C1', '#FFA0B4', '#FF8BA7', '#FF759A'], category: 'romance', finish: 'glossy' },
    { name: 'Eternal Love', colors: ['#DC143C', '#C41E3A', '#A01B2E', '#8B1820'], category: 'romance', finish: 'matte' },
    { name: 'Sweet Valentine', colors: ['#FF1493', '#FF69B4', '#FF85C1', '#FFA1D0'], category: 'romance', finish: 'glossy' },
    { name: 'Romantic Evening', colors: ['#8B475D', '#7B3F4E', '#6B373F', '#5B2F30'], category: 'romance', finish: 'satin' },
    
    // ========== EMOTIONS ==========
    { name: 'Passionate Fire', colors: ['#FF0000', '#E60000', '#CC0000', '#B30000'], category: 'emotion', finish: 'glossy' },
    { name: 'Calm Serenity', colors: ['#E6D4D1', '#D4C2BF', '#C2B0AD', '#B09E9B'], category: 'emotion', finish: 'matte' },
    { name: 'Bold Confidence', colors: ['#C70039', '#900C3F', '#581845', '#2E0A23'], category: 'emotion', finish: 'matte' },
    { name: 'Joyful Bliss', colors: ['#FF6B9D', '#FF8AAD', '#FFA9BD', '#FFC8CD'], category: 'emotion', finish: 'cream' },
    
    // ========== LOCATIONS ==========
    { name: 'Paris Romance', colors: ['#DC143C', '#C41E3A', '#B91B3E', '#A61840'], category: 'locations', finish: 'matte' },
    { name: 'Malibu Sunset', colors: ['#FF7F50', '#FF9468', '#FFA980', '#FFBE98'], category: 'locations', finish: 'glossy' },
    { name: 'Tokyo Nights', colors: ['#E91E63', '#D81B60', '#C2185B', '#AD1457'], category: 'locations', finish: 'satin' },
    { name: 'Santorini Dream', colors: ['#FFE4E1', '#FFD6D3', '#FFC8C5', '#FFBAB7'], category: 'locations', finish: 'cream' },
    
    // ========== SEASONAL - SPRING ==========
    { name: 'Spring Blossom', colors: ['#FFB6C1', '#FFA8C5', '#FF9AC9', '#FF8CCD'], category: 'spring', finish: 'glossy' },
    { name: 'Cherry Bloom', colors: ['#FFB7C5', '#FFA0B4', '#FF89A3', '#FF7292'], category: 'spring', finish: 'satin' },
    { name: 'Fresh Tulip', colors: ['#FF69B4', '#FF5AA5', '#FF4B96', '#FF3C87'], category: 'spring', finish: 'glossy' },
    
    // ========== SEASONAL - SUMMER ==========
    { name: 'Summer Heat', colors: ['#FF6347', '#FF5733', '#FF4B1F', '#FF3F0D'], category: 'summer', finish: 'glossy' },
    { name: 'Beach Vibes', colors: ['#FF7F50', '#FFA07A', '#FFB88C', '#FFD0A0'], category: 'summer', finish: 'cream' },
    { name: 'Tropical Paradise', colors: ['#FF6B6B', '#FF8787', '#FFA3A3', '#FFBFBF'], category: 'summer', finish: 'glossy' },
    
    // ========== SEASONAL - AUTUMN ==========
    { name: 'Autumn Leaves', colors: ['#8B4513', '#A0522D', '#B8860B', '#CD853F'], category: 'autumn', finish: 'matte' },
    { name: 'Pumpkin Spice', colors: ['#D2691E', '#C58A4A', '#B8732B', '#AB5C0C'], category: 'autumn', finish: 'cream' },
    { name: 'Harvest Moon', colors: ['#A0522D', '#8B4513', '#7B3F00', '#6B3410'], category: 'autumn', finish: 'matte' },
    
    // ========== SEASONAL - WINTER ==========
    { name: 'Winter Berry', colors: ['#8B1A1A', '#A52A2A', '#C41E3A', '#DC143C'], category: 'winter', finish: 'matte' },
    { name: 'Frosted Rose', colors: ['#E6C7C7', '#D4B3B3', '#C29F9F', '#B08B8B'], category: 'winter', finish: 'satin' },
    { name: 'Holiday Glam', colors: ['#B22222', '#A01010', '#8E0000', '#7C0000'], category: 'winter', finish: 'glossy' },
    
    // ========== FESTIVALS ==========
    { name: 'Diwali Gold', colors: ['#FFD700', '#FFC700', '#FFB700', '#FFA700'], category: 'festival', finish: 'glossy' },
    { name: 'Christmas Red', colors: ['#DC143C', '#C41E3A', '#AC1E2E', '#941E24'], category: 'festival', finish: 'matte' },
    { name: 'New Year Sparkle', colors: ['#FFD700', '#FF69B4', '#9370DB', '#4169E1'], category: 'festival', finish: 'glossy' },
    { name: 'Valentine Special', colors: ['#FF1493', '#FF69B4', '#FF85C1', '#FFA1D0'], category: 'festival', finish: 'glossy' },
    
    // ========== EVENTS ==========
    { name: 'Wedding Day', colors: ['#FFE4E1', '#FFD6D3', '#FFC8C5', '#FFBAB7'], category: 'events', finish: 'satin' },
    { name: 'Cocktail Party', colors: ['#DC143C', '#E91E63', '#9C27B0', '#673AB7'], category: 'events', finish: 'glossy' },
    { name: 'Business Meeting', colors: ['#D4A5A5', '#C89595', '#BC8F8F', '#B07D7D'], category: 'events', finish: 'matte' },
    { name: 'Night Out', colors: ['#8B0000', '#800020', '#660033', '#4A0E24'], category: 'events', finish: 'matte' },
    
    // ========== DESCRIPTIVE ==========
    { name: 'Velvet Touch', colors: ['#722F37', '#641E28', '#56161E', '#480E15'], category: 'descriptive', finish: 'matte' },
    { name: 'Silk Smooth', colors: ['#F8C8DC', '#F0B8CC', '#E8A8BC', '#E098AC'], category: 'descriptive', finish: 'satin' },
    { name: 'Glass Shine', colors: ['#FF69B4', '#FF1493', '#DB7093', '#C71585'], category: 'descriptive', finish: 'glossy' },
    { name: 'Powder Soft', colors: ['#FFD1DC', '#FFC0CB', '#FFB6C1', '#FFA8C5'], category: 'descriptive', finish: 'matte' },
    
    // ========== VERSATILE ==========
    { name: 'Day to Night', colors: ['#D4A5A5', '#C89595', '#A67B7B', '#8B6B6B'], category: 'versatile', finish: 'satin' },
    { name: 'All Season', colors: ['#BC8F8F', '#A87878', '#946161', '#804A4A'], category: 'versatile', finish: 'matte' },
    { name: 'Office to Party', colors: ['#C89595', '#B87878', '#A85B5B', '#983E3E'], category: 'versatile', finish: 'satin' },
  ];

  const categories = [
    { id: 'all', label: 'All Palettes', count: allPalettes.length },
    { id: 'nudes', label: 'Nudes', icon: '🤎' },
    { id: 'browns', label: 'Browns', icon: '🍫' },
    { id: 'pinks', label: 'Pinks', icon: '💗' },
    { id: 'reds', label: 'Reds', icon: '❤️' },
    { id: 'corals', label: 'Corals', icon: '🪸' },
    { id: 'multicolor', label: 'Multicolor', icon: '🌈' },
    { id: 'primary', label: 'Primary', icon: '🎨' },
    { id: 'food', label: 'Food', icon: '🍰' },
    { id: 'drink', label: 'Drinks', icon: '🍷' },
    { id: 'minerals', label: 'Minerals', icon: '💎' },
    { id: 'romance', label: 'Romance', icon: '💕' },
    { id: 'emotion', label: 'Emotions', icon: '🎭' },
    { id: 'locations', label: 'Locations', icon: '🗺️' },
    { id: 'spring', label: 'Spring', icon: '🌸' },
    { id: 'summer', label: 'Summer', icon: '☀️' },
    { id: 'autumn', label: 'Autumn', icon: '🍂' },
    { id: 'winter', label: 'Winter', icon: '❄️' },
    { id: 'festival', label: 'Festivals', icon: '🎉' },
    { id: 'events', label: 'Events', icon: '🎊' },
    { id: 'descriptive', label: 'Descriptive', icon: '✨' },
    { id: 'versatile', label: 'Versatile', icon: '🔄' },
  ];

  // Create individual colors database with names
  const allColors = [
    // Nudes
    { name: 'Ivory Nude', hex: '#F5E6D3', category: 'nudes', finish: 'matte', description: 'Light creamy nude' },
    { name: 'Beige Nude', hex: '#E8D4C0', category: 'nudes', finish: 'matte', description: 'Classic beige tone' },
    { name: 'Rose Nude', hex: '#D4A5A5', category: 'nudes', finish: 'matte', description: 'Rosy nude shade' },
    { name: 'Mauve Nude', hex: '#C89595', category: 'nudes', finish: 'matte', description: 'Mauve-toned nude' },
    { name: 'Peach Nude', hex: '#F0C5A8', category: 'nudes', finish: 'satin', description: 'Warm peachy nude' },
    { name: 'Caramel Nude', hex: '#D4A088', category: 'nudes', finish: 'satin', description: 'Deep caramel nude' },
    
    // Browns
    { name: 'Chocolate', hex: '#8B4513', category: 'browns', finish: 'matte', description: 'Rich chocolate brown' },
    { name: 'Caramel', hex: '#D2691E', category: 'browns', finish: 'glossy', description: 'Sweet caramel shade' },
    { name: 'Mocha', hex: '#A67B5B', category: 'browns', finish: 'satin', description: 'Coffee mocha tone' },
    { name: 'Cinnamon', hex: '#B5651D', category: 'browns', finish: 'cream', description: 'Warm cinnamon spice' },
    { name: 'Espresso', hex: '#3E2723', category: 'browns', finish: 'matte', description: 'Deep espresso brown' },
    { name: 'Toffee', hex: '#C68E5E', category: 'browns', finish: 'glossy', description: 'Golden toffee shade' },
    
    // Pinks
    { name: 'Baby Pink', hex: '#FFD1DC', category: 'pinks', finish: 'cream', description: 'Soft baby pink' },
    { name: 'Bubblegum', hex: '#FFC0CB', category: 'pinks', finish: 'cream', description: 'Classic bubblegum pink' },
    { name: 'Hot Pink', hex: '#FF69B4', category: 'pinks', finish: 'glossy', description: 'Vibrant hot pink' },
    { name: 'Fuchsia', hex: '#FF1493', category: 'pinks', finish: 'glossy', description: 'Bold fuchsia pink' },
    { name: 'Rose Pink', hex: '#FF66B2', category: 'pinks', finish: 'satin', description: 'Classic rose pink' },
    { name: 'Dusty Rose', hex: '#DCAE96', category: 'pinks', finish: 'matte', description: 'Muted dusty rose' },
    { name: 'Blush', hex: '#F4C2C2', category: 'pinks', finish: 'cream', description: 'Natural blush pink' },
    { name: 'Magenta', hex: '#FF00FF', category: 'pinks', finish: 'glossy', description: 'Electric magenta' },
    
    // Reds
    { name: 'Classic Red', hex: '#DC143C', category: 'reds', finish: 'matte', description: 'Timeless red' },
    { name: 'Cherry Red', hex: '#DE3163', category: 'reds', finish: 'glossy', description: 'Juicy cherry red' },
    { name: 'Wine Red', hex: '#722F37', category: 'reds', finish: 'matte', description: 'Deep wine red' },
    { name: 'Burgundy', hex: '#800020', category: 'reds', finish: 'matte', description: 'Rich burgundy' },
    { name: 'Ruby', hex: '#E0115F', category: 'reds', finish: 'glossy', description: 'Gemstone ruby red' },
    { name: 'Crimson', hex: '#DC143C', category: 'reds', finish: 'matte', description: 'Deep crimson red' },
    { name: 'Scarlet', hex: '#FF2400', category: 'reds', finish: 'satin', description: 'Bright scarlet' },
    { name: 'Brick Red', hex: '#CB4154', category: 'reds', finish: 'matte', description: 'Earthy brick red' },
    { name: 'Blood Red', hex: '#8B0000', category: 'reds', finish: 'matte', description: 'Dark blood red' },
    { name: 'Poppy Red', hex: '#E32636', category: 'reds', finish: 'satin', description: 'Vibrant poppy red' },
    
    // Corals
    { name: 'Coral', hex: '#FF7F50', category: 'corals', finish: 'glossy', description: 'Classic coral' },
    { name: 'Peach', hex: '#FFCBA4', category: 'corals', finish: 'cream', description: 'Soft peach coral' },
    { name: 'Salmon', hex: '#FFA07A', category: 'corals', finish: 'glossy', description: 'Salmon pink coral' },
    { name: 'Sunset Coral', hex: '#FF7F50', category: 'corals', finish: 'satin', description: 'Sunset coral shade' },
    { name: 'Living Coral', hex: '#FF6F61', category: 'corals', finish: 'glossy', description: 'Trendy living coral' },
    { name: 'Tangerine', hex: '#FF8066', category: 'corals', finish: 'glossy', description: 'Bright tangerine' },
    
    // Berries & Purples
    { name: 'Berry', hex: '#C71585', category: 'multicolor', finish: 'glossy', description: 'Deep berry shade' },
    { name: 'Plum', hex: '#8E4585', category: 'multicolor', finish: 'satin', description: 'Rich plum purple' },
    { name: 'Lavender', hex: '#E6E6FA', category: 'multicolor', finish: 'satin', description: 'Soft lavender' },
    { name: 'Violet', hex: '#8E44AD', category: 'multicolor', finish: 'satin', description: 'Deep violet purple' },
    { name: 'Orchid', hex: '#DA70D6', category: 'multicolor', finish: 'glossy', description: 'Bright orchid' },
    { name: 'Lilac', hex: '#DDA0DD', category: 'multicolor', finish: 'satin', description: 'Pale lilac' },
    
    // Oranges & Warm
    { name: 'Orange', hex: '#FF7F00', category: 'multicolor', finish: 'glossy', description: 'Bright orange' },
    { name: 'Burnt Orange', hex: '#CC5500', category: 'multicolor', finish: 'matte', description: 'Deep burnt orange' },
    { name: 'Terracotta', hex: '#E2725B', category: 'browns', finish: 'matte', description: 'Earthy terracotta' },
    { name: 'Apricot', hex: '#FDB99B', category: 'corals', finish: 'cream', description: 'Soft apricot' },
    
    // Special Shades
    { name: 'Merlot', hex: '#722F37', category: 'reds', finish: 'matte', description: 'Wine merlot shade' },
    { name: 'Raspberry', hex: '#E30B5C', category: 'reds', finish: 'glossy', description: 'Fresh raspberry' },
    { name: 'Strawberry', hex: '#FF6B6B', category: 'pinks', finish: 'glossy', description: 'Sweet strawberry' },
    { name: 'Cranberry', hex: '#9B1B30', category: 'reds', finish: 'matte', description: 'Tart cranberry' },
    { name: 'Pomegranate', hex: '#A01239', category: 'reds', finish: 'glossy', description: 'Rich pomegranate' },
    { name: 'Sangria', hex: '#8B1A1A', category: 'reds', finish: 'glossy', description: 'Wine sangria' },
    
    // Romantic Shades
    { name: 'First Kiss', hex: '#FFB6C1', category: 'romance', finish: 'glossy', description: 'Sweet first kiss pink' },
    { name: 'Eternal Love', hex: '#DC143C', category: 'romance', finish: 'matte', description: 'Timeless love red' },
    { name: 'Sweet Heart', hex: '#FF1493', category: 'romance', finish: 'glossy', description: 'Valentine sweetheart' },
    { name: 'Romantic', hex: '#8B475D', category: 'romance', finish: 'satin', description: 'Soft romantic mauve' },
  ];

  const filteredPalettes = allPalettes.filter(palette => {
    const matchesSearch = palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         palette.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         palette.finish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || palette.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredColors = allColors.filter(color => {
    const matchesSearch = color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         color.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         color.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         color.finish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || color.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setShowCameraOptions(false);
    }
  };

  const handleCaptureClick = () => {
    setShowCameraOptions(!showCameraOptions);
  };

  const analyzeWithAI = async (analysisType) => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setAnalyzing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];

        try {
          const response = await axios.post(
            `${API}/analyze/ai-shade`,
            {
              image_base64: base64,
              analysis_type: analysisType
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setResult(response.data);
          setShadeName(response.data.suggested_name);
          toast.success('AI analysis complete!');
        } catch (error) {
          toast.error('AI analysis failed');
          console.error(error);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error('Failed to process image');
      setAnalyzing(false);
    }
  };

  const saveShade = async () => {
    if (!result || !shadeName.trim()) {
      toast.error('Please provide a name for your shade');
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API}/shades`,
        {
          name: shadeName,
          rgb: result.dominant_color,
          lab: result.lab_values,
          hex_color: result.hex_color,
          source: 'ai'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('AI-recommended shade saved!');
      setSelectedFile(null);
      setResult(null);
      setShadeName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Failed to save shade');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePaletteColorClick = async (color, paletteName) => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const rgb = { r, g, b };
    const lab = { l: 50, a: 0, b: 0 }; // Simplified LAB

    const shadeData = {
      id: `temp_${Date.now()}`,
      name: `${paletteName} - ${color}`,
      rgb: rgb,
      lab: lab,
      hex_color: color,
      source: 'trending'
    };

    // Store for quick dispense
    localStorage.setItem('quick_dispense_shade', JSON.stringify(shadeData));
    toast.success(`Selected ${paletteName} shade`);
    navigate('/device');
  };

  return (
    <div className="fade-in" data-testid="ai-shade-finder-page">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">AI Shade Finder</h2>
          <p className="text-gray-600">Discover perfect shades with AI-powered recommendations</p>
        </div>

        <Tabs defaultValue="reference" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="reference" data-testid="tab-reference">Reference Look</TabsTrigger>
            <TabsTrigger value="event" data-testid="tab-event">Event Look</TabsTrigger>
            <TabsTrigger value="trending" data-testid="tab-trending">Trending Palettes</TabsTrigger>
          </TabsList>

          <TabsContent value="reference" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700"><span className="font-semibold">Reference Look:</span> Upload a photo of someone wearing a lipstick shade you love. AI will extract the exact color for you.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-white/40 hover:bg-white/60 transition-colors">
                  {!showCameraOptions ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="reference-file-upload"
                        data-testid="reference-file-input"
                      />
                      <label htmlFor="reference-file-upload" className="cursor-pointer block">
                        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 mb-4">
                          <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                          {selectedFile ? selectedFile.name : 'Upload reference photo'}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">Celebrity or influencer photo with visible lipstick</p>
                      </label>
                      
                      <Button
                        onClick={handleCaptureClick}
                        variant="outline"
                        className="mt-4 rounded-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Or Capture with Camera
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700 font-medium mb-4">Choose capture method:</p>
                      
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="camera-capture-ref"
                      />
                      <label htmlFor="camera-capture-ref" className="cursor-pointer">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors">
                          <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Take Photo</p>
                          <p className="text-xs text-gray-500">Use camera to capture</p>
                        </div>
                      </label>

                      <label htmlFor="reference-file-upload" className="cursor-pointer">
                        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-colors">
                          <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Choose from Gallery</p>
                          <p className="text-xs text-gray-500">Pick existing photo</p>
                        </div>
                      </label>

                      <Button
                        onClick={() => setShowCameraOptions(false)}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected"
                        className="w-full h-64 object-cover"
                        data-testid="reference-preview-image"
                      />
                    </div>
                    <Button
                      onClick={() => analyzeWithAI('reference_look')}
                      disabled={analyzing}
                      data-testid="reference-analyze-button"
                      className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                    >
                      <Wand2 className="w-5 h-5" />
                      <span>{analyzing ? 'Extracting shade...' : 'Extract Lipstick Color'}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {result ? (
                  <>
                    <div className="bg-white/60 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800">AI Extracted Shade</h3>
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: result.hex_color }}
                        data-testid="ai-color-preview"
                      ></div>
                      <div className="text-sm">
                        <p className="text-gray-500 font-medium mb-1">AI Description</p>
                        <p className="text-gray-700 leading-relaxed" data-testid="ai-description">
                          {result.ai_description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <div>
                          <p className="text-gray-500 font-medium">Hex</p>
                          <p className="text-gray-800 font-mono">{result.hex_color}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">RGB</p>
                          <p className="text-gray-800 font-mono">
                            {result.dominant_color.r}, {result.dominant_color.g}, {result.dominant_color.b}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ai-shade-name" className="text-gray-700 mb-2 block">Shade Name</Label>
                        <Input
                          id="ai-shade-name"
                          value={shadeName}
                          onChange={(e) => setShadeName(e.target.value)}
                          placeholder="Name your AI-discovered shade"
                          data-testid="ai-shade-name-input"
                          className="bg-white/60 border-purple-200 focus:border-purple-400"
                        />
                      </div>
                      <Button
                        onClick={saveShade}
                        disabled={saving}
                        data-testid="ai-save-shade-button"
                        className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                      >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save to My Shades'}</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/40 rounded-2xl p-8 text-center h-full flex items-center justify-center">
                    <div>
                      <Wand2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Upload a photo to get AI recommendations</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700"><span className="font-semibold">Event Look:</span> Upload your selfie or outfit photo. AI will recommend the perfect lipstick shade to complement your look.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-rose-300 rounded-2xl p-8 text-center bg-white/40 hover:bg-white/60 transition-colors">
                  {!showCameraOptions ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="event-file-upload"
                        data-testid="event-file-input"
                      />
                      <label htmlFor="event-file-upload" className="cursor-pointer block">
                        <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 mb-4">
                          <Sparkles className="w-8 h-8 text-rose-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                          {selectedFile ? selectedFile.name : 'Upload your photo'}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">Selfie or outfit photo for personalized recommendations</p>
                      </label>
                      
                      <Button
                        onClick={handleCaptureClick}
                        variant="outline"
                        className="mt-4 rounded-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Or Capture with Camera
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700 font-medium mb-4">Choose capture method:</p>
                      
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="camera-capture-event"
                      />
                      <label htmlFor="camera-capture-event" className="cursor-pointer">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors">
                          <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Take Selfie</p>
                          <p className="text-xs text-gray-500">Use front camera</p>
                        </div>
                      </label>

                      <label htmlFor="event-file-upload" className="cursor-pointer">
                        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-colors">
                          <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Choose from Gallery</p>
                          <p className="text-xs text-gray-500">Pick existing photo</p>
                        </div>
                      </label>

                      <Button
                        onClick={() => setShowCameraOptions(false)}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected"
                        className="w-full h-64 object-cover"
                        data-testid="event-preview-image"
                      />
                    </div>
                    <Button
                      onClick={() => analyzeWithAI('event_look')}
                      disabled={analyzing}
                      data-testid="event-analyze-button"
                      className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                    >
                      <Wand2 className="w-5 h-5" />
                      <span>{analyzing ? 'Analyzing your look...' : 'Get AI Recommendation'}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {result ? (
                  <>
                    <div className="bg-white/60 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-gray-800">AI Recommended Shade</h3>
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: result.hex_color }}
                        data-testid="event-color-preview"
                      ></div>
                      <div className="text-sm">
                        <p className="text-gray-500 font-medium mb-1">AI Recommendation</p>
                        <p className="text-gray-700 leading-relaxed" data-testid="event-ai-description">
                          {result.ai_description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <div>
                          <p className="text-gray-500 font-medium">Hex</p>
                          <p className="text-gray-800 font-mono">{result.hex_color}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">RGB</p>
                          <p className="text-gray-800 font-mono">
                            {result.dominant_color.r}, {result.dominant_color.g}, {result.dominant_color.b}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-shade-name" className="text-gray-700 mb-2 block">Shade Name</Label>
                        <Input
                          id="event-shade-name"
                          value={shadeName}
                          onChange={(e) => setShadeName(e.target.value)}
                          placeholder="Name your personalized shade"
                          data-testid="event-shade-name-input"
                          className="bg-white/60 border-rose-200 focus:border-rose-400"
                        />
                      </div>
                      <Button
                        onClick={saveShade}
                        disabled={saving}
                        data-testid="event-save-shade-button"
                        className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-6 rounded-full flex items-center justify-center space-x-2"
                      >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save to My Shades'}</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/40 rounded-2xl p-8 text-center h-full flex items-center justify-center">
                    <div>
                      <Wand2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Upload your photo for AI recommendations</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Explore {allPalettes.length}+ curated palettes organized by colors, themes, seasons & finishes</p>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search palettes... (e.g., nude, glossy, romance, spring)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/60 border-pink-200 focus:border-rose-400 rounded-full"
                  data-testid="palette-search"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.slice(0, 12).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white'
                        : 'bg-white/60 text-gray-700 hover:bg-white/80'
                    }`}
                    data-testid={`category-${cat.id}`}
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.label}
                  </button>
                ))}
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* More Categories Dropdown */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                  + Show More Categories ({categories.length - 12} more)
                </summary>
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.slice(12).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white'
                          : 'bg-white/60 text-gray-700 hover:bg-white/80'
                      }`}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </details>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex bg-white/60 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('palettes')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      viewMode === 'palettes'
                        ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white'
                        : 'text-gray-700'
                    }`}
                    data-testid="view-palettes"
                  >
                    Palettes ({allPalettes.length})
                  </button>
                  <button
                    onClick={() => setViewMode('colors')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      viewMode === 'colors'
                        ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white'
                        : 'text-gray-700'
                    }`}
                    data-testid="view-colors"
                  >
                    Colors ({allColors.length})
                  </button>
                </div>
                
                {/* Results Count */}
                <p className="text-sm text-gray-500">
                  {viewMode === 'palettes' 
                    ? `Showing ${filteredPalettes.length} of ${allPalettes.length} palettes`
                    : `Showing ${filteredColors.length} of ${allColors.length} colors`}
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
                </p>
              </div>
            </div>

            {viewMode === 'palettes' ? (
              // PALETTES VIEW
              filteredPalettes.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No palettes found. Try a different search term.</p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPalettes.map((palette, index) => (
                <div key={index} className="bg-white/60 rounded-2xl p-6 hover:shadow-lg transition-shadow" data-testid={`palette-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{palette.name}</h3>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {palette.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      palette.finish === 'matte' ? 'bg-purple-100 text-purple-700' :
                      palette.finish === 'glossy' ? 'bg-pink-100 text-pink-700' :
                      palette.finish === 'satin' ? 'bg-rose-100 text-rose-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {palette.finish}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {palette.colors.map((color, colorIndex) => (
                      <div key={colorIndex} className="relative group">
                        <button
                          onClick={() => handlePaletteColorClick(color, palette.name)}
                          data-testid={`palette-color-${index}-${colorIndex}`}
                          className="w-full aspect-square rounded-xl shadow-md hover:scale-110 transition-transform cursor-pointer relative"
                          style={{ backgroundColor: color }}
                          title={`Click to dispense ${color}`}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1 font-mono">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
                </div>
              )
            ) : (
              // COLORS VIEW
              filteredColors.length === 0 ? (
                <div className="text-center py-12">
                  <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No colors found. Try a different search term.</p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredColors.map((color, index) => {
                    // Convert hex to RGB
                    const r = parseInt(color.hex.slice(1, 3), 16);
                    const g = parseInt(color.hex.slice(3, 5), 16);
                    const b = parseInt(color.hex.slice(5, 7), 16);
                    
                    const colorData = {
                      id: `color_${index}`,
                      name: color.name,
                      rgb: { r, g, b },
                      lab: { l: 50, a: 0, b: 0 },
                      hex_color: color.hex,
                      source: 'trending'
                    };

                    return (
                      <div
                        key={index}
                        className="bg-white/60 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => handlePaletteColorClick(color.hex, color.name)}
                        data-testid={`color-${index}`}
                      >
                        {/* Color Swatch */}
                        <div
                          className="h-32 relative group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: color.hex }}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Droplet className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        
                        {/* Color Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                            {color.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {color.description}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {color.hex}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              color.finish === 'matte' ? 'bg-purple-100 text-purple-700' :
                              color.finish === 'glossy' ? 'bg-pink-100 text-pink-700' :
                              color.finish === 'satin' ? 'bg-rose-100 text-rose-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {color.finish}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIShadeFinder;