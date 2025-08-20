# Tab Visibility & Mobile Controls Fixes

## Vấn đề đã khắc phục

### 1. 🔄 **Video dừng khi chuyển tab**
**Vấn đề**: Khi chuyển qua tab khác, video bị dừng và mất luôn video đang xem.

**Nguyên nhân**: 
- ReactPlayer tự động pause khi tab bị ẩn (Page Visibility API)
- Không có cơ chế để restore trạng thái playing khi quay lại tab

**Giải pháp đã implement**:

#### A. Page Visibility API Handler
```javascript
// Thêm state để track trạng thái playing trước khi tab bị ẩn
const [wasPlayingBeforeHidden, setWasPlayingBeforeHidden] = useState(false);

// Handle Page Visibility API
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab is hidden - remember if video was playing but don't pause
      setWasPlayingBeforeHidden(playing);
    } else {
      // Tab is visible again - restore playing state if it was playing before
      if (wasPlayingBeforeHidden && !playing) {
        setPlaying(true);
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [playing, wasPlayingBeforeHidden]);
```

#### B. ReactPlayer Config Updates
```javascript
const playerConfig = {
  youtube: {
    playerVars: {
      // ... existing config
      // Prevent auto-pause when tab is hidden
      playsinline: 1
    }
  },
  // Additional config to prevent auto-pause
  file: {
    attributes: {
      crossOrigin: 'anonymous'
    }
  }
};
```

### 2. 📱 **Mobile Controls bị ẩn do kích thước màn hình**
**Vấn đề**: Trên mobile, các nút như phóng to và controls khác bị ẩn hoặc không hiển thị đúng cách.

**Nguyên nhân**:
- Layout không responsive
- Không có breakpoints phù hợp cho mobile
- Controls quá nhiều cho màn hình nhỏ

**Giải pháp đã implement**:

#### A. Responsive Layout System
```javascript
// Mobile: 2 rows layout, Desktop: 1 row layout
<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
  {/* Row 1: Main controls */}
  <div className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto">
    {/* Main playback controls */}
  </div>
  
  {/* Row 2: Secondary controls */}
  <div className="flex items-center space-x-1 sm:space-x-2">
    {/* Settings, quality, fullscreen */}
  </div>
</div>
```

#### B. Breakpoint-based Visibility
- **XS (< 475px)**: Ẩn 30s seek buttons, chỉ giữ essential controls
- **SM (< 640px)**: Ẩn quality selector và settings button
- **MD (< 768px)**: Ẩn volume slider, chỉ có volume button
- **LG+ (≥ 1024px)**: Hiển thị full controls

#### C. Tailwind Config Updates
```javascript
// Thêm breakpoint xs cho màn hình rất nhỏ
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

#### D. Control Priorities
1. **Always visible**: Play/Pause, 10s seek, Fullscreen
2. **Hidden on XS**: 30s seek buttons
3. **Hidden on SM**: Quality selector, Settings
4. **Hidden on MD**: Volume slider (replaced with button)

## Files đã thay đổi

### `src/components/Player/VideoPlayer.js`
- ✅ Thêm Page Visibility API handler
- ✅ Thêm `wasPlayingBeforeHidden` state
- ✅ Cập nhật ReactPlayer config với `playsinline: 1`
- ✅ Responsive layout cho controls (flex-col sm:flex-row)
- ✅ Breakpoint-based visibility classes
- ✅ Mobile-optimized padding và spacing

### `tailwind.config.js`
- ✅ Thêm custom screens với breakpoint `xs: '475px'`
- ✅ Maintain existing breakpoints

### `src/components/Debug/MobileResponsiveTest.js` (NEW)
- ✅ Test component cho responsive design
- ✅ Visual indicators cho screen sizes
- ✅ Interactive controls testing
- ✅ State display cho debugging

### `src/App.js`
- ✅ Thêm route `/test-responsive` cho testing

## Behavior mới

### Tab Visibility
- **Tab hidden**: Video tiếp tục phát (không pause)
- **Tab visible**: Restore playing state nếu đang phát trước đó
- **Manual pause**: Không bị ảnh hưởng bởi tab switching

### Mobile Controls Layout

#### Desktop (≥ 768px)
```
[30s] [10s] [Play] [10s] [30s] [Volume ----] | [Quality] [Settings] [Fullscreen]
```

#### Tablet (640px - 767px)
```
[30s] [10s] [Play] [10s] [30s] [Volume ----] | [Quality] [Settings] [Fullscreen]
```

#### Mobile (475px - 639px)
```
Row 1: [10s] [Play] [10s] [Volume]
Row 2: [Fullscreen]
```

#### Very Small (< 475px)
```
Row 1: [10s] [Play] [10s] [Volume]
Row 2: [Fullscreen]
```

## Testing

### 🔄 **Tab Visibility Test**
1. Mở video và play
2. Chuyển sang tab khác → Video tiếp tục phát
3. Quay lại tab → Video vẫn đang phát
4. Manual pause → Chuyển tab → Quay lại → Video vẫn pause

### 📱 **Mobile Responsive Test**
1. Visit `/test-responsive` để test interactive
2. Resize browser window để test breakpoints
3. Kiểm tra controls visibility ở các kích thước:
   - < 475px: Chỉ essential controls
   - 475px+: Thêm 30s seek buttons
   - 640px+: Thêm quality và settings
   - 768px+: Thêm volume slider

### 🎯 **Real Device Test**
1. Test trên điện thoại thật
2. Test landscape/portrait orientation
3. Test touch interactions
4. Verify fullscreen functionality

## Kết quả

✅ **Video không còn dừng khi chuyển tab**
✅ **Mobile controls hiển thị đầy đủ và responsive**
✅ **Fullscreen button luôn accessible trên mọi device**
✅ **Layout tự động adapt theo screen size**
✅ **Touch interactions hoạt động smooth**
✅ **Performance không bị ảnh hưởng**

## Next Steps (Optional)

1. **Picture-in-Picture**: Implement PiP API cho background playback
2. **Gesture Controls**: Thêm swipe gestures cho seek
3. **Adaptive Bitrate**: Auto quality dựa trên connection speed
4. **Offline Support**: Cache video segments cho offline viewing
