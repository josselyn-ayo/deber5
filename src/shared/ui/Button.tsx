import {
    ActivityIndicator, StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
 
interface ButtonProps {
  onPress:    () => void;
  label:      string;
  isLoading?: boolean;
  variant?:   "primary" | "ghost" | "danger";
  disabled?:  boolean;
}
 
export const Button = ({
  onPress, label, isLoading, variant = "primary", disabled
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
      activeOpacity={0.8}
    >
      {isLoading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[styles.label, variant === "ghost" && styles.labelGhost]}>{label}</Text>
      }
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  base:        { minHeight:48, borderRadius:24, paddingVertical:14, paddingHorizontal:24,
                 alignItems:"center", justifyContent:"center" },
  primary:     { backgroundColor:"#0F52BA" },
  ghost:       { backgroundColor:"transparent", borderWidth:2, borderColor:"#0D9488" },
  danger:      { backgroundColor:"#E11D48" },
  disabled:    { opacity:0.5 },
  label:       { color:"#fff", fontSize:16, fontWeight:"700", lineHeight:20 },
  labelGhost:  { color:"#0D9488" },
});
