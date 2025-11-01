import { Text, TextProps, TextStyle } from "react-native";

const weightToFamily = (style?: TextStyle) => {
  const w = (style?.fontWeight || "400").toString();
  switch (w) {
    case "700":
    case "bold":
      return "RubikBold";
    case "600":
      return "RubikSemiBold";
    case "500":
      return "RubikMedium";
    case "300":
      return "RubikLight"; // only if you loaded it
    default:
      return "RubikRegular";
  }
};

export default function AppText({ style, ...rest }: TextProps) {
  const family = weightToFamily(Array.isArray(style) ? Object.assign({}, ...style) : (style as TextStyle));
  return <Text {...rest} style={[{ fontFamily: family }, style]} />;
}
