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
}
 
export const Input = ({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType = "default", error,
  autoCapitalize = "none",
  rightAccessory,
}: InputProps) => (
  <View style={styles.wrapper}>
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
        style={[styles.input, rightAccessory ? styles.inputWithAccessory : null]}
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
                      borderColor:"#CBD5E1", borderRadius:10, backgroundColor:"#F8FAFC" },
  input:            { flex:1, paddingHorizontal:16, paddingVertical:13, fontSize:15,
                      color:"#0F172A" },
  inputWithAccessory: { paddingRight:8 },
  accessory:        { paddingRight:14 },
  inputError:       { borderColor:"#DC2626" },
  error:            { fontSize:12, color:"#DC2626" },
});
