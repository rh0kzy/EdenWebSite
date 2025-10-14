# 🧪 Quick Test Guide - Enhanced Search

## Test Scenarios

### ✅ Test 1: Basic Search
**Steps:**
1. Open `http://localhost:3000/catalog.html`
2. Type "sauvage" in search box
3. **Expected:** All Sauvage perfumes appear

**Pass Criteria:** Results filter in real-time

---

### ✅ Test 2: Accent-Insensitive Search
**Steps:**
1. Open catalog or admin-manage
2. Type "cafe" (no accent)
3. **Expected:** "Café" perfumes appear

**Pass Criteria:** Accented names are found

---

### ✅ Test 3: Multi-Word Search
**Steps:**
1. Type "dior homme" in search
2. **Expected:** Only "Dior Homme" perfumes appear

**Pass Criteria:** Both words must be present

---

### ✅ Test 4: Reference Search
**Steps:**
1. Type "1105" in search
2. **Expected:** Perfume with reference 1105 appears

**Pass Criteria:** Reference numbers searchable

---

### ✅ Test 5: Keyboard Shortcuts
**Steps:**
1. Press `Ctrl+K` (or `Cmd+K` on Mac)
2. **Expected:** Search box focuses and text selects
3. Press `Escape`
4. **Expected:** Search clears and box blurs

**Pass Criteria:** Shortcuts work correctly

---

### ✅ Test 6: Brand Filter (Admin)
**Steps:**
1. Open `http://localhost:3000/admin-manage.html`
2. Type "dior" in brand filter
3. **Expected:** Only Dior perfumes appear

**Pass Criteria:** Brand filter works independently

---

### ✅ Test 7: Combined Filters
**Steps:**
1. Type "homme" in search
2. Select "Men" in gender filter
3. **Expected:** Only men's perfumes with "homme" appear

**Pass Criteria:** All filters combine with AND logic

---

### ✅ Test 8: URL Persistence (Catalog Only)
**Steps:**
1. Open catalog
2. Search "dior" and select "Men" gender
3. Check URL: Should show `?search=dior&gender=men`
4. Refresh page
5. **Expected:** Filters are restored

**Pass Criteria:** URL updates and persists

---

### ✅ Test 9: Clear Filters
**Steps:**
1. Apply multiple filters
2. Click "Clear Filters" button
3. **Expected:** All filters reset, all items shown

**Pass Criteria:** Everything resets

---

### ✅ Test 10: Performance
**Steps:**
1. Type quickly: "abcdefgh"
2. **Expected:** Search waits 250ms after last keystroke
3. **Expected:** No lag or freezing

**Pass Criteria:** Smooth and responsive

---

## Quick Commands

### Focus Search (Anywhere on Page)
```
Windows/Linux: Ctrl + K
Mac: Cmd + K
```

### Clear Search (When Focused)
```
Press: Escape
```

### Navigate Results
```
Click on perfume card
Opens WhatsApp (catalog)
Opens edit modal (admin)
```

## Common Issues & Solutions

### Issue: Search not working
**Solution:** Check browser console for errors, refresh page

### Issue: Accents still required
**Solution:** Clear browser cache, verify searchUtils.js loaded

### Issue: Keyboard shortcuts not working
**Solution:** Check for browser extension conflicts

### Issue: URL not updating (Catalog)
**Solution:** Verify you're on catalog.html, not admin pages

## Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Performance Benchmarks

Expected performance:
- Search response: < 100ms
- Filter update: < 50ms
- Debounce delay: 250ms
- Page load: < 2s

## Success Indicators

All tests pass if:
1. ✅ Search works with accents
2. ✅ Multi-word search works
3. ✅ Keyboard shortcuts respond
4. ✅ Filters combine correctly
5. ✅ Performance is smooth
6. ✅ URL persists (catalog)
7. ✅ No console errors

## Report Issues

If any test fails:
1. Note the test number
2. Check browser console
3. Note error messages
4. Try different browser
5. Clear cache and retry
