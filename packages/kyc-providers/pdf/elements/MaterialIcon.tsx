// import React from "react";
// import { Circle, Path, Rect, Polygon, Line, Polyline, Ellipse, Svg } from "@react-pdf/renderer";
// import { IconType } from "react-icons";

// interface MaterialIconProps {
//   icon: IconType;
//   size?: number;
//   color?: string;
// }

// export const MaterialIcon: React.FC<MaterialIconProps> = ({ icon, size = 24, color = "black" }) => {
//   // Render the react-icon as a React element
//   const iconElement = icon({ fill: color, size });


    
//   // Children can be a single element or array
//   const children = React.Children.toArray(iconElement);

//   const viewBox = iconElement?.toString() || "0 0 24 24";

//   return (
//     <Svg viewBox={viewBox} style={{ width: size, height: size }}>
//       {children.map((child: any, index: number) => {
//         switch (child.type) {
//           case "path":
//             return <Path key={index} d={child.props.d} fill={child.props.fill || color} />;
//           case "circle":
//             return (
//               <Circle
//                 key={index}
//                 cx={child.props.cx}
//                 cy={child.props.cy}
//                 r={child.props.r}
//                 fill={child.props.fill || color}
//               />
//             );
//           case "rect":
//             return (
//               <Rect
//                 key={index}
//                 x={child.props.x}
//                 y={child.props.y}
//                 width={child.props.width}
//                 height={child.props.height}
//                 rx={child.props.rx}
//                 ry={child.props.ry}
//                 fill={child.props.fill || color}
//               />
//             );
//           case "polygon":
//             return <Polygon key={index} points={child.props.points} fill={child.props.fill || color} />;
//           case "polyline":
//             return <Polyline key={index} points={child.props.points} fill={child.props.fill || color} />;
//           case "line":
//             return (
//               <Line
//                 key={index}
//                 x1={child.props.x1}
//                 y1={child.props.y1}
//                 x2={child.props.x2}
//                 y2={child.props.y2}
//                 stroke={child.props.stroke || color}
//               />
//             );
//           case "ellipse":
//             return (
//               <Ellipse
//                 key={index}
//                 cx={child.props.cx}
//                 cy={child.props.cy}
//                 rx={child.props.rx}
//                 ry={child.props.ry}
//                 fill={child.props.fill || color}
//               />
//             );
//           default:
//             return null;
//         }
//       })}
//     </Svg>
//   );
// };
