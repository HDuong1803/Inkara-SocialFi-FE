export const bytes32ToString = (value: string) => {
    if (!value) return '';
    // Remove '0x' prefix if present
    const hex = value.toString().substring(0, 2) === '0x'
        ? value.toString().substring(2)
        : value.toString();

    // Convert hex to string and remove trailing zeros
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) break; // Stop at first null character
        str += String.fromCharCode(code);
    }
    return str;
};

export const getStatusStyle = (status: string) => {
    const styles = {
      ONGOING: 'bg-green-100/20 text-green-500 border border-green-500/30',
      ENDED: 'bg-neutral2-10 text-tertiary border border-neutral2-20',
    };
    return (
      styles[status as keyof typeof styles] ||
      'bg-neutral2-10 text-tertiary border border-neutral2-20'
    );
  };