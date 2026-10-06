import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    console.error("[booth]", error.message);
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="screen screen-center">
        <p className="eyebrow">AI Photobooth</p>
        <h1>Something went wrong.</h1>
        <p className="lede">The booth hit an unexpected problem. You can start again.</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            this.setState({ hasError: false });
            this.props.onReset();
          }}
        >
          Try Again
        </button>
      </main>
    );
  }
}
