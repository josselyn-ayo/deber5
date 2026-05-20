import LottieView from "lottie-react-native";
import { StyleProp, ViewStyle } from "react-native";

export type LottieVariant = "hero" | "success" | "loading";

const lottieSources: Record<LottieVariant, { uri: string }> = {
  hero: {
    uri: "https://assets10.lottiefiles.com/packages/lf20_4kx2q32n.json",
  },
  success: {
    uri: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  },
  loading: {
    uri: "https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json",
  },
};

interface Props {
  variant?: LottieVariant;
  size?: number;
  style?: StyleProp<ViewStyle>;
  loop?: boolean;
}

export const LottieIllustration = ({
  variant = "hero",
  size = 180,
  style,
  loop = true,
}: Props) => {
  return (
    <LottieView
      source={lottieSources[variant]}
      autoPlay
      loop={loop}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};