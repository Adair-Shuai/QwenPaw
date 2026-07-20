import mph
print('Testing COMSOL connection...')
try:
    client = mph.Client(version='6.1')
    print(f'Connected! Version: {client.version}')
    print(f'Cores: {client.cores}')
    print(f'Standalone: {client.standalone}')
except Exception as e:
    print(f'Error with 6.1: {e}')
    try:
        client = mph.Client()
        print(f'Connected! Version: {client.version}')
    except Exception as e2:
        print(f'Error (no version): {e2}')
