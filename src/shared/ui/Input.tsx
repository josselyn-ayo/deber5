import { ReactNode } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
 
interface InputProps {
  label?:          string;
  value:           string;
  onChangeText:    (t: string) => void;
  placeholder?:    string;
  secureTextEntry?: boolean;
  keyboardType?:   "default" | "email-address" | "numeric" | "decimal-pad";
  error?:          string;
  autoCapitalize?: "none" | "sentences" | "words";
  rightAccessory?: ReactNode;
  inputStyle?: any;
  wrapperStyle?: any;
}
 
export const Input = ({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType = "default", error,
  autoCapitalize = "none",
  rightAccessory, inputStyle, wrapperStyle,
}: InputProps) => (
  <View style={[styles.wrapper, wrapperStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={[styles.inputRow, error ? styles.inputError : null]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[styles.input, rightAccessory ? styles.inputWithAccessory : null, inputStyle]}
      />
      {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
 
const styles = StyleSheet.create({
  wrapper:          { gap:6 },
  label:            { fontSize:14, fontWeight:"500", color:"#334155" },
  inputRow:         { flexDirection:"row", alignItems:"center", borderWidth:1.5,
                      borderColor:"#E6EEF7", borderRadius:12, backgroundColor:"#FFFFFF" },
  input:            { flex:1, paddingHorizontal:18, paddingVertical:14, fontSize:16,
                      color:"#0F172A" },
  inputWithAccessory: { paddingRight:8 },
  accessory:        { paddingRight:14 },
  inputError:       { borderColor:"#DC2626" },
  error:            { fontSize:12, color:"#DC2626" },
});
