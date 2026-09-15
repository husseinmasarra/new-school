import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white border-2 border-red-500 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-red-600">حدث خطأ أثناء تحميل الصفحة</h2>
            <p className="text-xs text-slate-600">
              يرجى إعادة تحميل الصفحة أو تحديث البيانات للاستمرار بشكل طبيعي.
            </p>
            <div className="bg-slate-100 p-3 rounded-xl text-left text-[11px] font-mono text-red-700 overflow-x-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#/dashboard';
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-[#0284C7] text-white rounded-xl text-xs font-bold shadow hover:bg-[#0369A1] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>العودة للوحة التحكم وإعادة التحميل 🔄</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
