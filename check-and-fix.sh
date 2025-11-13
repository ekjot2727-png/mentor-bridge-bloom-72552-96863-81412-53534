#!/bin/bash
echo "=== Full Project Check & Fix ==="
echo ""

echo "1. Backend Dependencies..."
cd backend
npm install --no-fund

echo ""
echo "2. Frontend Dependencies..."
cd ..
npm install --no-fund

echo ""
echo "3. Building Backend..."
cd backend
npm run build

echo ""
echo "4. Check for TypeScript Errors..."
npx tsc --noEmit

echo ""
echo "✅ Full check complete!"
echo ""
echo "Next steps:"
echo "1. Start Backend: cd backend && npm run start:dev"
echo "2. Start Frontend: npm run dev"
echo ""
