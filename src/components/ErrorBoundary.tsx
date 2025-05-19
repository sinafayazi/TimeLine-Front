import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error | null) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call optional error handler prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        // If fallback is a function, call it with the error
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error);
        }
        // Otherwise render it directly
        return this.props.fallback;
      }

      // Otherwise render default error UI
      return (
        <View className="flex-1 items-center justify-center p-4 bg-gray-100">
          <Text className="text-lg font-bold text-red-600 mb-2">Something went wrong</Text>
          <Text className="text-sm text-gray-700 mb-4 text-center">
            {this.state.error?.message || 'An unknown error occurred'}
          </Text>
          
          <TouchableOpacity
            onPress={this.resetError}
            className="px-4 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // When there's no error, render children
    return this.props.children;
  }
}

export default ErrorBoundary;