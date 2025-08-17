I will collect here ideas around the food analysis pipeline.

Goal is having a single image as input and returning a nutrition estimate.

The hard parts are image classification and portion estimation. After image is classified, we can use a database of food items to get nutrition values.

## Pipeline Steps:

1. **Image Upload**: User uploads a meal image.
2. **Image Preprocessing**: Handled automatically by inference provider.
3. **Image Classification**: Use pluggable inference providers for food classification.
   - Currently supporting: Hugging Face Inference API
   - Future providers: TensorFlow.js, OpenAI Vision, Google Vision AI
   - Model: `nateraw/food` (Food-101 based) via Hugging Face
4. **Portion Estimation**: Estimate the portion size using techniques like:
   - Object detection to find food items in the image.
   - Depth estimation to gauge portion size.
   - Reference object detection (e.g., utensils, plates)
5. **Nutrition Estimation**:
   - Use a database of food items to get nutrition values based on the classified meal and estimated portion size.
   - Map classification results to nutrition database entries
6. **Result Compilation**: Compile the nutrition estimates into a structured format.
7. **Display Results**: Show the nutrition breakdown to the user in the app.

## Technical Implementation:

- **Architecture**: Modular inference providers
- **Current Provider**: Hugging Face Inference API
- **Model**: `nateraw/food` - Food-101 classification model (as per official example)
- **Authentication**: Requires Hugging Face API token
- **Fallback**: Manual food entry if classification confidence is low
- **Rate Limits**: Free tier has usage limits, consider upgrading for production

## Setup Instructions:

1. Create a Hugging Face account at https://huggingface.co
2. Read about [Inference Providers](https://huggingface.co/docs/inference-providers/index) to understand:
   - Free vs Pro tiers and rate limits
   - Different hosting options (Serverless, Dedicated)
   - Pricing and usage monitoring
3. Generate an API token in your account settings
4. Add `VITE_HUGGING_FACE_TOKEN=your_token` to your `.env` file
5. The model will be ready to use immediately

## Hugging Face Inference Setup:

- **Free Tier**: Limited requests per month, good for development
- **Pro Tier**: Higher rate limits, better for production
- **Model**: `nateraw/food` - optimized for Food-101 classification (matches official example)
- **Documentation**: https://huggingface.co/docs/inference-providers/index

## Usage Example:

```typescript
import { useFoodClassification } from '@/composables/useFoodClassification'
import { createHuggingFaceInference } from '@/lib/huggingface'

const hfProvider = createHuggingFaceInference('nateraw/food')
const { classifyFood, loading, error } = useFoodClassification(hfProvider)
```

## Dependencies:

- `@huggingface/inference` - Official Hugging Face Inference Client
- Requires Node.js environment variables or browser-compatible token handling

## Troubleshooting:

- **NoneType error**: Usually indicates model processing issues, try:
  - Different image format (JPG instead of PNG)
  - Smaller image size (< 5MB)
  - Wait for model to load (first request may take longer)
- **503 errors**: Model is loading, wait and retry
- **401/403 errors**: Check your API token
