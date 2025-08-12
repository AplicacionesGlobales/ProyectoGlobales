# Navigation Loading Components

This system provides smooth loading transitions between authentication screens with a professional user experience.

## Components

### useNavigationLoading Hook

A custom hook that manages navigation loading states with smooth transitions.

```tsx
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

const { isNavigating, navigateWithLoading, navigatingTo } = useNavigationLoading();
```

**Methods:**
- `navigateWithLoading(route, options)` - Navigate with loading overlay
- `isNavigating` - Boolean state indicating if navigation is in progress
- `navigatingTo` - String indicating destination route

**Options:**
- `delay?: number` - Minimum loading time (default: 500ms)
- `message?: string` - Custom loading message
- `replace?: boolean` - Use router.replace instead of router.push

### NavigationLoadingOverlay

A beautiful modal overlay that shows during navigation transitions.

```tsx
import { NavigationLoadingOverlay } from '@/components/navigation';

<NavigationLoadingOverlay
  visible={isNavigating}
  destination={navigatingTo}
  message="Custom message"
/>
```

**Props:**
- `visible: boolean` - Controls overlay visibility
- `destination?: string` - Route destination for auto-generated messages
- `message?: string` - Custom loading message (overrides auto-generated)

## Implementation Examples

### Login Screen Navigation

```tsx
export default function LoginScreen() {
  const { isNavigating, navigateWithLoading, navigatingTo } = useNavigationLoading();

  const handleRegister = async () => {
    await navigateWithLoading('/register', {
      delay: 600,
      message: 'Opening Sign Up...'
    });
  };

  const handleForgotPassword = async () => {
    await navigateWithLoading('/(auth)/forgot-password/ForgotPassword', {
      delay: 600,
      message: 'Opening Forgot Password...'
    });
  };

  return (
    <View>
      {/* Your login UI */}
      
      {/* Navigation Loading Overlay */}
      <NavigationLoadingOverlay
        visible={isNavigating}
        destination={navigatingTo}
      />
    </View>
  );
}
```

### Register Screen Navigation

```tsx
export default function RegisterScreen() {
  const { isNavigating, navigateWithLoading, navigatingTo } = useNavigationLoading();

  const navigateToLogin = async () => {
    await navigateWithLoading('./login', {
      delay: 600,
      message: 'Opening Sign In...'
    });
  };

  return (
    <View>
      {/* Your register UI */}
      
      {/* Navigation Loading Overlay */}
      <NavigationLoadingOverlay
        visible={isNavigating}
        destination={navigatingTo}
      />
    </View>
  );
}
```

## Auto-Generated Messages

The `NavigationLoadingOverlay` automatically generates user-friendly messages based on destination routes:

| Route | Message |
|-------|---------|
| `/register` | "Opening Sign Up..." |
| `/(auth)/forgot-password/ForgotPassword` | "Opening Forgot Password..." |
| `/login` | "Opening Sign In..." |
| `/(auth)/plan_selection` | "Loading Plan Selection..." |
| `/(admin-tabs)/appointments` | "Loading Dashboard..." |
| `/(client-tabs)` | "Loading App..." |
| Other routes | "Navigating..." |

## Customization

### Custom Loading Messages

```tsx
await navigateWithLoading('/register', {
  delay: 800,
  message: 'Creating your account...'
});
```

### Different Loading Times

```tsx
// Quick transition
await navigateWithLoading('/login', { delay: 300 });

// Slower transition for complex screens
await navigateWithLoading('/dashboard', { delay: 1000 });
```

### Replace vs Push Navigation

```tsx
// Use router.push (default)
await navigateWithLoading('/register');

// Use router.replace
await navigateWithLoading('/dashboard', { replace: true });
```

## Best Practices

1. **Consistent Timing**: Use similar delay times (500-600ms) for similar actions
2. **Descriptive Messages**: Use clear, action-oriented messages in English
3. **Minimum Loading Time**: Always use a minimum delay for perceived performance
4. **Replace for Authentication**: Use `replace: true` when navigating to authenticated areas
5. **Overlay Placement**: Always place the overlay at the root level of your component

## UX Benefits

- **Smooth Transitions**: No jarring instant navigation changes
- **Professional Feel**: Loading states indicate system responsiveness
- **User Feedback**: Clear messages about what's happening
- **Perceived Performance**: Minimum loading times prevent "flash" effects
- **Consistent Experience**: Same loading pattern across all auth screens

## Implementation Status

✅ **Implemented in:**
- Login screen (`login.tsx`)
- Register screen (`register.tsx`) 
- Forgot Password screen (`ForgotPassword.tsx`)

🔄 **Navigation Routes Covered:**
- Login ↔ Register
- Login → Forgot Password
- Forgot Password → Login
- Register → Login

All navigation transitions in the authentication flow now include smooth loading states with appropriate messages in English.
