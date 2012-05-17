import os, sys

def processSchedFile(fileName):
    os.rename(fileName, 'orig_' + fileName)
    fIn = open('orig_' + fileName, 'r')
    fOut = open(fileName, 'w')
    first = True
    for line in fIn:
        if line.endswith('\n'):
            line = line[0:len(line) - 1]
        parts = line.split(',')
        if first:
            first = False
            for i in range(0,7):
                fOut.write(parts[i] + ',')
            fOut.write('Surplus\n')
        elif len(parts) > 1:            
            for i in range(0, 7):
                fOut.write(parts[i] + ',')
            for i in range(7, 12):
                if int(parts[i]) == 1:
                    fOut.write(str(11 - i) + '\n')
                    break
        else:
            fOut.write(line)
    fIn.close()
    fOut.close()

if __name__ == '__main__':
    processSchedFile(sys.argv[1])
