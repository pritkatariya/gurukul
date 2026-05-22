import { toast } from "sonner";

export const handleUserView = (id: string | number, item: any) => {
  try {
    const userDetails = `
User ID: ${id}
Full Name: ${item?.name || "-"}
Role / Position: ${item?.role || "-"}
Username: ${item?.dept || "-"}
Joined Date: ${item?.date || "-"}
Status: ${item?.status || "-"}
`;

    window.alert(userDetails);
  } catch (error) {
    console.error(error);
    toast.error("Unable to view user details");
  }
};