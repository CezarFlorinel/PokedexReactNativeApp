import React from "react";
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps extends Omit<TextInputProps, "onChange"> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
}

export default function SearchBar({ value, onChangeText, onClear, placeholder = "Search for Pokémon..", ...rest }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color="#1C1A33" style={styles.iconLeft} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA0A6"
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="close-circle" size={18} color="#9AA0A6" style={styles.iconRight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0E0940",
    paddingVertical: 8,
  },
});
